# Database Guide - PathFinder AI

## Database Type

**SQLite** - A lightweight, file-based database system

## Database Location

**File Path:** `backend/pathfinder.db`

This is a single file database that contains all your application data.

---

## Database Schema

### Tables in the Database:

1. **`users`** - User accounts
   - id, email, hashed_password, full_name, created_at

2. **`user_profiles`** - User profile information
   - id, user_id, degree, cgpa_10th, cgpa_12th, cgpa_sem1-8
   - skills (JSON), certifications (JSON), achievements (JSON)
   - career_interests (JSON), resume_path, extracted_skills (JSON)
   - created_at

3. **`recruiters`** - Recruiter accounts
   - id, email, hashed_password, company_name, created_at

4. **`jobs`** - Job postings
   - id, recruiter_id, title, description, skills_required (JSON)
   - location, salary, industry, status, created_at

5. **`roadmaps`** - Generated learning roadmaps
   - id, user_id, target_career, roadmap_data (JSON)
   - selected_variant, feedback_rating, created_at

---

## How to View the Database

### Option 1: Using DB Browser for SQLite (Recommended - GUI Tool)

1. **Download DB Browser for SQLite:**
   - Windows: https://sqlitebrowser.org/dl/
   - Or search "DB Browser for SQLite" in your browser

2. **Open the database:**
   - Launch DB Browser for SQLite
   - Click "Open Database"
   - Navigate to: `C:\Users\nsaij\Downloads\PathfinderAI\backend\pathfinder.db`
   - Click "Open"

3. **View data:**
   - Click on "Browse Data" tab
   - Select a table from the dropdown (users, user_profiles, jobs, etc.)
   - View all records in a table format
   - You can edit, add, or delete records directly

4. **Run SQL queries:**
   - Click on "Execute SQL" tab
   - Write SQL queries like:
     ```sql
     SELECT * FROM users;
     SELECT * FROM user_profiles;
     SELECT * FROM jobs WHERE status = 'open';
     ```

---

### Option 2: Using Python Script (Command Line)

I'll create a simple Python script to view the database:

```python
# view_database.py
import sqlite3
import json
from datetime import datetime

def view_database():
    conn = sqlite3.connect('pathfinder.db')
    cursor = conn.cursor()
    
    # Get all table names
    cursor.execute("SELECT name FROM sqlite_master WHERE type='table';")
    tables = cursor.fetchall()
    
    print("="*70)
    print("PATHFINDER AI DATABASE VIEWER")
    print("="*70)
    
    for table in tables:
        table_name = table[0]
        print(f"\n{'='*70}")
        print(f"TABLE: {table_name}")
        print(f"{'='*70}")
        
        # Get row count
        cursor.execute(f"SELECT COUNT(*) FROM {table_name}")
        count = cursor.fetchone()[0]
        print(f"Total Records: {count}\n")
        
        if count > 0:
            # Get all data
            cursor.execute(f"SELECT * FROM {table_name}")
            rows = cursor.fetchall()
            
            # Get column names
            cursor.execute(f"PRAGMA table_info({table_name})")
            columns = [col[1] for col in cursor.fetchall()]
            
            # Print column headers
            print(" | ".join(columns))
            print("-" * 70)
            
            # Print rows (limit to 10 for readability)
            for row in rows[:10]:
                formatted_row = []
                for item in row:
                    if isinstance(item, str) and len(item) > 50:
                        formatted_row.append(item[:47] + "...")
                    elif isinstance(item, (dict, list)):
                        formatted_row.append(str(item)[:47] + "...")
                    else:
                        formatted_row.append(str(item))
                print(" | ".join(formatted_row))
            
            if len(rows) > 10:
                print(f"\n... and {len(rows) - 10} more records")
        else:
            print("(No records)")
    
    conn.close()

if __name__ == "__main__":
    view_database()
```

**To use this script:**
```bash
cd backend
python view_database.py
```

---

### Option 3: Using SQLite Command Line

1. **Open Command Prompt/PowerShell**
2. **Navigate to backend folder:**
   ```bash
   cd C:\Users\nsaij\Downloads\PathfinderAI\backend
   ```

3. **Open SQLite:**
   ```bash
   sqlite3 pathfinder.db
   ```

4. **Run SQL commands:**
   ```sql
   .tables                    -- List all tables
   .schema users              -- Show table structure
   SELECT * FROM users;       -- View all users
   SELECT * FROM user_profiles;
   SELECT * FROM jobs;
   .exit                      -- Exit SQLite
   ```

---

### Option 4: Using VS Code Extension

1. **Install SQLite Viewer extension in VS Code:**
   - Search for "SQLite Viewer" in VS Code extensions
   - Install it

2. **Open the database file:**
   - Right-click on `pathfinder.db` in VS Code
   - Select "Open Database"
   - View tables and data in VS Code

---

## Quick Database Queries

### View all users:
```sql
SELECT id, email, full_name, created_at FROM users;
```

### View user profiles with skills:
```sql
SELECT u.email, u.full_name, p.degree, p.skills, p.extracted_skills 
FROM users u 
JOIN user_profiles p ON u.id = p.user_id;
```

### View all jobs:
```sql
SELECT id, title, industry, location, status, created_at FROM jobs;
```

### View roadmaps:
```sql
SELECT u.email, r.target_career, r.selected_variant, r.created_at 
FROM roadmaps r 
JOIN users u ON r.user_id = u.id;
```

### Count records per table:
```sql
SELECT 
    'users' as table_name, COUNT(*) as count FROM users
UNION ALL
SELECT 'user_profiles', COUNT(*) FROM user_profiles
UNION ALL
SELECT 'recruiters', COUNT(*) FROM recruiters
UNION ALL
SELECT 'jobs', COUNT(*) FROM jobs
UNION ALL
SELECT 'roadmaps', COUNT(*) FROM roadmaps;
```

---

## Database File Size

The database file (`pathfinder.db`) will grow as you add more data:
- **Empty database:** ~0 KB
- **With users/profiles:** ~10-50 KB
- **With jobs/roadmaps:** ~50-500 KB
- **Large dataset:** Can grow to several MB

---

## Backup the Database

To backup your database:
```bash
# Copy the file
copy backend\pathfinder.db backend\pathfinder_backup.db

# Or use SQLite backup command
sqlite3 pathfinder.db ".backup pathfinder_backup.db"
```

---

## Reset the Database

⚠️ **Warning:** This will delete all data!

```bash
# Delete the database file
del backend\pathfinder.db

# The database will be recreated automatically when you start the server
```

---

## Database Location Summary

- **Type:** SQLite (file-based)
- **File:** `backend/pathfinder.db`
- **Full Path:** `C:\Users\nsaij\Downloads\PathfinderAI\backend\pathfinder.db`
- **View Tool:** DB Browser for SQLite (recommended)
- **Command Line:** `sqlite3 pathfinder.db`

---

## Notes

- SQLite is perfect for development and small to medium applications
- All data is stored in a single file
- No separate database server needed
- Easy to backup (just copy the file)
- Can be easily migrated to PostgreSQL/MySQL if needed later

