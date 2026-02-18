
import sys
import os
from pathlib import Path
from datetime import datetime

# Add backend directory to path
current_dir = Path(__file__).resolve().parent
backend_dir = current_dir.parent
sys.path.append(str(backend_dir))

from app.database import SessionLocal
from app.models import User, UserProfile, Roadmap, Job, JobInteraction

def seed_full_profile():
    print("Seeding full demo profile for test@example.com...")
    db = SessionLocal()
    try:
        # 1. Get User
        user = db.query(User).filter(User.email == "test@example.com").first()
        if not user:
            print("❌ User test@example.com not found. Please run seed_rag.py first.")
            return

        # 2. Create/Update Profile with Rich Data
        print(f"Updating profile for user: {user.full_name}")
        
        # Check if profile exists
        profile = db.query(UserProfile).filter(UserProfile.user_id == user.id).first()
        
        profile_data = {
            "degree": "B.Tech in Computer Science & Engineering",
            "course": "Specialization in AI & ML",
            "cgpa_10th": 9.4,
            "cgpa_12th": 9.2,
            "total_cgpa": 8.9,
            "cgpa_sem1": 8.5, "cgpa_sem2": 8.7,
            "cgpa_sem3": 8.8, "cgpa_sem4": 9.0,
            "cgpa_sem5": 8.9, "cgpa_sem6": 9.1,
            # Broad skill set to match multiple jobs
            "skills": [
                "Python", "Java", "C++", 
                "HTML", "CSS", "JavaScript", 
                "SQL", "Git"
            ],
            "extracted_skills": [ # Simulate skills parsed from a resume
                "React.js", "Node.js", "Express", "MongoDB",
                "Machine Learning", "TensorFlow", "Pandas", "NumPy",
                "AWS (EC2, S3)", "Docker", "REST APIs"
            ],
            "certifications": [
                "AWS Certified Cloud Practitioner",
                "Deep Learning Specialization (Coursera)",
                "Full Stack Web Development Bootcamp"
            ],
            "achievements": [
                "Winner of Smart India Hackathon 2025",
                "Published research paper on NLP in IEEE Conference",
                "Open Source Contributor to Mozilla"
            ],
            "career_interests": [
                "Full Stack Developer", 
                "AI Engineer", 
                "Data Scientist"
            ],
            # Fake a resume path so UI shows "Resume Uploaded"
            "resume_path": "uploads/demo_resume.pdf" 
        }

        if profile:
            # Update existing
            for key, value in profile_data.items():
                setattr(profile, key, value)
        else:
            # Create new
            profile = UserProfile(user_id=user.id, **profile_data)
            db.add(profile)
        
        # 3. Add a Demo Roadmap (if none exists)
        if not db.query(Roadmap).filter(Roadmap.user_id == user.id).first():
            print("Creating demo roadmap...")
            demo_roadmap = {
                "phases": [
                    {
                        "phase_id": 1,
                        "phase_name": "Foundation Consolidation",
                        "tasks": [
                            {"title": "Advanced Python Patterns", "status": "completed"},
                            {"title": "Data Structures Refresher", "status": "in_progress"}
                        ]
                    },
                    {
                        "phase_id": 2,
                        "phase_name": "System Design",
                        "tasks": [
                            {"title": "Microservices Architecture", "status": "pending"},
                            {"title": "Database Sharding", "status": "pending"}
                        ]
                    }
                ]
            }
            roadmap = Roadmap(
                user_id=user.id,
                title="AI Engineer Path",
                target_career="AI Engineer",
                roadmap_data={"roadmap": demo_roadmap},
                roadmap_type="career"
            )
            db.add(roadmap)

        db.commit()
        print("✅ Full demo profile seeded successfully!")
        print("   - Rich academic & skill data populated")
        print("   - Resume metadata simulated")
        print("   - Demo roadmap created")

    except Exception as e:
        print(f"❌ Error seeding profile: {e}")
        db.rollback()
    finally:
        db.close()

if __name__ == "__main__":
    seed_full_profile()
