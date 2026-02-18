"""
Migration script to add new columns to user_profiles table:
- course (String, nullable)
- total_cgpa (Float, nullable)
"""
import sqlite3
import os

DB_PATH = os.path.join(os.path.dirname(__file__), 'pathfinder.db')

def migrate():
    conn = sqlite3.connect(DB_PATH)
    cursor = conn.cursor()
    
    try:
        # Check if columns already exist
        cursor.execute("PRAGMA table_info(user_profiles)")
        columns = [col[1] for col in cursor.fetchall()]
        
        # Add course if it doesn't exist
        if 'course' not in columns:
            print("Adding course column...")
            cursor.execute("ALTER TABLE user_profiles ADD COLUMN course VARCHAR")
            print("✓ Added course column")
        else:
            print("✓ course column already exists")
        
        # Add total_cgpa if it doesn't exist
        if 'total_cgpa' not in columns:
            print("Adding total_cgpa column...")
            cursor.execute("ALTER TABLE user_profiles ADD COLUMN total_cgpa REAL")
            print("✓ Added total_cgpa column")
        else:
            print("✓ total_cgpa column already exists")
        
        conn.commit()
        print("\n✓ Migration completed successfully!")
        print("The user_profiles table now supports course and total_cgpa fields.")
        
    except Exception as e:
        conn.rollback()
        print(f"\n✗ Migration failed: {e}")
        raise
    finally:
        conn.close()

if __name__ == "__main__":
    print("Starting user_profiles table migration...\n")
    migrate()

