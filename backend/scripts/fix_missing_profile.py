
import sys
import os
from pathlib import Path

# Add backend directory to path
current_dir = Path(__file__).resolve().parent
backend_dir = current_dir.parent
sys.path.append(str(backend_dir))

from app.database import SessionLocal
from app.models import User, UserProfile

def fix_missing_profile():
    print("Checking for missing user profiles...")
    db = SessionLocal()
    try:
        # Find the test user
        user = db.query(User).filter(User.email == "test@example.com").first()
        if not user:
            print("User test@example.com not found. Please run seed_rag.py first.")
            return

        # Check if profile exists
        profile = db.query(UserProfile).filter(UserProfile.user_id == user.id).first()
        if profile:
            print(f"Profile already exists for user: {user.email}")
        else:
            print(f"Creating default profile for user: {user.email}")
            new_profile = UserProfile(
                user_id=user.id,
                degree="B.Tech Computer Science",
                course="Engineering",
                cgpa_10th=9.0,
                cgpa_12th=8.5,
                total_cgpa=8.8,
                skills=["Python", "React", "Machine Learning"],
                career_interests=["Software Engineer", "Data Scientist"]
            )
            db.add(new_profile)
            db.commit()
            print("Profile created successfully.")
            
    except Exception as e:
        print(f"Error fixing profile: {e}")
        db.rollback()
    finally:
        db.close()

if __name__ == "__main__":
    fix_missing_profile()
