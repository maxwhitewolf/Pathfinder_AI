"""Migration script to add new columns to jobs table"""
import sqlite3
from pathlib import Path

DB_PATH = Path(__file__).parent / "pathfinder.db"

def migrate():
    conn = sqlite3.connect(str(DB_PATH))
    cursor = conn.cursor()
    
    try:
        # Get existing columns
        cursor.execute("PRAGMA table_info(jobs)")
        existing_columns = [row[1] for row in cursor.fetchall()]
        
        # Add new columns if they don't exist
        new_columns = [
            ("job_title", "TEXT"),
            ("company_name", "TEXT"),
            ("location_city", "TEXT"),
            ("location_country", "TEXT"),
            ("is_remote", "BOOLEAN DEFAULT 0"),
            ("work_type", "TEXT DEFAULT 'onsite'"),
            ("job_type", "TEXT DEFAULT 'full_time'"),
            ("experience_level", "TEXT DEFAULT 'fresher'"),
            ("min_experience_years", "INTEGER"),
            ("max_experience_years", "INTEGER"),
            ("min_salary", "INTEGER"),
            ("max_salary", "INTEGER"),
            ("salary_currency", "TEXT DEFAULT 'INR'"),
            ("salary_pay_period", "TEXT DEFAULT 'year'"),
            ("is_salary_visible", "BOOLEAN DEFAULT 1"),
            ("jd_text", "TEXT"),
            ("nice_to_have_skills", "TEXT"),  # JSON stored as TEXT in SQLite
            ("employment_level", "TEXT"),
            ("application_url", "TEXT"),
            ("application_email", "TEXT"),
            ("application_deadline", "DATE"),
            ("roadmap_json", "TEXT"),  # JSON stored as TEXT
            ("updated_at", "TIMESTAMP"),
        ]
        
        for col_name, col_type in new_columns:
            if col_name not in existing_columns:
                try:
                    cursor.execute(f"ALTER TABLE jobs ADD COLUMN {col_name} {col_type}")
                    print(f"✓ Added column: {col_name}")
                except sqlite3.OperationalError as e:
                    print(f"✗ Error adding {col_name}: {e}")
        
        # Migrate existing data
        cursor.execute("SELECT id, title, description, location, salary FROM jobs WHERE job_title IS NULL")
        rows = cursor.fetchall()
        
        for row_id, title, description, location, salary in rows:
            cursor.execute("""
                UPDATE jobs 
                SET job_title = ?, 
                    company_name = (SELECT company_name FROM recruiters WHERE recruiters.id = jobs.recruiter_id),
                    jd_text = ?,
                    location_city = ?,
                    location_country = ?,
                    description = ?
                WHERE id = ?
            """, (title or "", description or "", location or "", location or "", description or "", row_id))
            print(f"✓ Migrated job ID: {row_id}")
        
        conn.commit()
        print("\n✓ Migration completed successfully!")
        
    except Exception as e:
        conn.rollback()
        print(f"\n✗ Migration failed: {e}")
        raise
    finally:
        conn.close()

if __name__ == "__main__":
    print("Starting job table migration...")
    migrate()

