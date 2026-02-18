
import sys
import os
from pathlib import Path

# Add backend directory to path to allow imports
current_dir = Path(__file__).resolve().parent
backend_dir = current_dir.parent
sys.path.append(str(backend_dir))

from app.database import SessionLocal
from app.models import User, Recruiter
from app.auth import get_password_hash

def fix_passwords():
    print("Fixing database passwords...")
    db = SessionLocal()
    try:
        # Fix User
        user = db.query(User).filter(User.email == "test@example.com").first()
        if user:
            print(f"Updating password for user: {user.email}")
            user.hashed_password = get_password_hash("password123")
            db.add(user)
        else:
            print("User test@example.com not found.")

        # Fix Recruiter
        recruiter = db.query(Recruiter).filter(Recruiter.email == "recruiter@example.com").first()
        if recruiter:
            print(f"Updating password for recruiter: {recruiter.email}")
            recruiter.hashed_password = get_password_hash("password123")
            db.add(recruiter)
        else:
            print("Recruiter recruiter@example.com not found.")
            
        db.commit()
        print("Passwords updated successfully to 'password123'.")
        
    except Exception as e:
        print(f"Error updating passwords: {e}")
        db.rollback()
    finally:
        db.close()

if __name__ == "__main__":
    fix_passwords()
