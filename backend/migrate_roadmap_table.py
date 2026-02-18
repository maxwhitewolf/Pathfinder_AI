"""
Migration script to add new columns to roadmaps table:
- job_id (Integer, nullable)
- roadmap_type (String, default="career")
- title (String, nullable)
"""
import sqlite3
import os

DB_PATH = os.path.join(os.path.dirname(__file__), 'pathfinder.db')

def migrate():
    conn = sqlite3.connect(DB_PATH)
    cursor = conn.cursor()
    
    try:
        # Check if columns already exist
        cursor.execute("PRAGMA table_info(roadmaps)")
        columns = [col[1] for col in cursor.fetchall()]
        
        # Add job_id if it doesn't exist
        if 'job_id' not in columns:
            print("Adding job_id column...")
            cursor.execute("ALTER TABLE roadmaps ADD COLUMN job_id INTEGER")
            print("✓ Added job_id column")
        else:
            print("✓ job_id column already exists")
        
        # Add roadmap_type if it doesn't exist
        if 'roadmap_type' not in columns:
            print("Adding roadmap_type column...")
            cursor.execute("ALTER TABLE roadmaps ADD COLUMN roadmap_type VARCHAR DEFAULT 'career'")
            print("✓ Added roadmap_type column")
        else:
            print("✓ roadmap_type column already exists")
        
        # Add title if it doesn't exist
        if 'title' not in columns:
            print("Adding title column...")
            cursor.execute("ALTER TABLE roadmaps ADD COLUMN title VARCHAR")
            print("✓ Added title column")
        else:
            print("✓ title column already exists")
        
        # Update existing roadmaps to have roadmap_type='career' if null
        cursor.execute("UPDATE roadmaps SET roadmap_type = 'career' WHERE roadmap_type IS NULL")
        
        conn.commit()
        print("\n✓ Migration completed successfully!")
        
    except Exception as e:
        conn.rollback()
        print(f"\n✗ Migration failed: {e}")
        raise
    finally:
        conn.close()

if __name__ == "__main__":
    print("Starting roadmap table migration...\n")
    migrate()

