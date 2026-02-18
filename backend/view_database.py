"""
Simple script to view PathFinder AI database contents
Usage: python view_database.py
"""

import sqlite3
import json
from datetime import datetime
from pathlib import Path

def format_value(value):
    """Format a value for display"""
    if value is None:
        return "NULL"
    if isinstance(value, (dict, list)):
        try:
            json_str = json.dumps(value)
            if len(json_str) > 50:
                return json_str[:47] + "..."
            return json_str
        except:
            return str(value)[:50]
    if isinstance(value, str) and len(value) > 50:
        return value[:47] + "..."
    return str(value)

def view_database():
    """View all tables and data in the database"""
    db_path = Path(__file__).parent / 'pathfinder.db'
    
    if not db_path.exists():
        print(f"Database file not found: {db_path}")
        print("The database will be created when you first run the application.")
        return
    
    try:
        conn = sqlite3.connect(str(db_path))
        cursor = conn.cursor()
        
        # Get all table names
        cursor.execute("SELECT name FROM sqlite_master WHERE type='table' ORDER BY name;")
        tables = cursor.fetchall()
        
        print("="*80)
        print("PATHFINDER AI DATABASE VIEWER")
        print("="*80)
        print(f"Database: {db_path}")
        print(f"File Size: {db_path.stat().st_size / 1024:.2f} KB")
        print("="*80)
        
        if not tables:
            print("\nNo tables found in database.")
            conn.close()
            return
        
        for table in tables:
            table_name = table[0]
            print(f"\n{'='*80}")
            print(f"TABLE: {table_name.upper()}")
            print(f"{'='*80}")
            
            # Get row count
            cursor.execute(f"SELECT COUNT(*) FROM {table_name}")
            count = cursor.fetchone()[0]
            print(f"Total Records: {count}\n")
            
            if count > 0:
                # Get column names
                cursor.execute(f"PRAGMA table_info({table_name})")
                columns = [col[1] for col in cursor.fetchall()]
                
                # Get all data
                cursor.execute(f"SELECT * FROM {table_name}")
                rows = cursor.fetchall()
                
                # Print column headers
                header = " | ".join([col[:15].ljust(15) for col in columns])
                print(header)
                print("-" * len(header))
                
                # Print rows (limit to 20 for readability)
                for row in rows[:20]:
                    formatted_row = []
                    for item in row:
                        formatted_value = format_value(item)
                        formatted_row.append(formatted_value[:15].ljust(15))
                    print(" | ".join(formatted_row))
                
                if len(rows) > 20:
                    print(f"\n... and {len(rows) - 20} more records (showing first 20)")
                
                # Show some statistics
                print(f"\nSample data from {table_name}:")
                if table_name == 'users' and rows:
                    print(f"  - First user: {rows[0][1] if len(rows[0]) > 1 else 'N/A'}")
                elif table_name == 'user_profiles' and rows:
                    print(f"  - Profiles with skills: {sum(1 for r in rows if r[6])}")
                elif table_name == 'jobs' and rows:
                    open_jobs = sum(1 for r in rows if len(r) > 7 and r[7] == 'open')
                    print(f"  - Open jobs: {open_jobs}")
            else:
                print("(No records in this table)")
        
        # Summary
        print(f"\n{'='*80}")
        print("DATABASE SUMMARY")
        print(f"{'='*80}")
        for table in tables:
            table_name = table[0]
            cursor.execute(f"SELECT COUNT(*) FROM {table_name}")
            count = cursor.fetchone()[0]
            print(f"  {table_name:20} : {count:5} records")
        
        conn.close()
        print(f"\n{'='*80}")
        print("To view/edit database, use DB Browser for SQLite:")
        print("https://sqlitebrowser.org/")
        print(f"{'='*80}")
        
    except sqlite3.Error as e:
        print(f"Database error: {e}")
    except Exception as e:
        print(f"Error: {e}")

if __name__ == "__main__":
    view_database()

