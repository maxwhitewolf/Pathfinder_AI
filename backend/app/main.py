from fastapi import FastAPI, Depends, HTTPException, UploadFile, File, Query
from fastapi.middleware.cors import CORSMiddleware
from fastapi.security import OAuth2PasswordRequestForm
from sqlalchemy.orm import Session
from sqlalchemy import or_, and_, func, case, String
from typing import List, Optional
from datetime import datetime, timedelta, date
import uvicorn

from app import models, schemas, auth, database, ml_service, gemini_service
from app.database import engine, get_db
from app.job_routes import router as job_router
from app.phase2_routes import router as phase2_router
from app.job_roadmap_service import generate_job_roadmap

models.Base.metadata.create_all(bind=engine)

app = FastAPI(title="PathFinder AI API")

# Include enhanced job routes
app.include_router(job_router)
app.include_router(phase2_router)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


@app.post("/api/auth/register-user", response_model=schemas.UserResponse)
def register_user(user: schemas.UserCreate, db: Session = Depends(get_db)):
    db_user = db.query(models.User).filter(models.User.email == user.email).first()
    if db_user:
        raise HTTPException(status_code=400, detail="Email already registered")
    
    try:
        hashed_password = auth.get_password_hash(user.password)
    except ValueError as e:
        raise HTTPException(status_code=400, detail=str(e))
    db_user = models.User(
        email=user.email,
        hashed_password=hashed_password,
        full_name=user.full_name
    )
    db.add(db_user)
    db.commit()
    db.refresh(db_user)
    return db_user


@app.post("/api/auth/register-recruiter", response_model=schemas.RecruiterResponse)
def register_recruiter(recruiter: schemas.RecruiterCreate, db: Session = Depends(get_db)):
    db_recruiter = db.query(models.Recruiter).filter(models.Recruiter.email == recruiter.email).first()
    if db_recruiter:
        raise HTTPException(status_code=400, detail="Email already registered")
    
    try:
        hashed_password = auth.get_password_hash(recruiter.password)
    except ValueError as e:
        raise HTTPException(status_code=400, detail=str(e))
    db_recruiter = models.Recruiter(
        email=recruiter.email,
        hashed_password=hashed_password,
        company_name=recruiter.company_name
    )
    db.add(db_recruiter)
    db.commit()
    db.refresh(db_recruiter)
    return db_recruiter


@app.post("/api/auth/login")
def login(form_data: OAuth2PasswordRequestForm = Depends(), db: Session = Depends(get_db)):
    user = db.query(models.User).filter(models.User.email == form_data.username).first()
    if user and auth.verify_password(form_data.password, user.hashed_password):
        access_token = auth.create_access_token(data={"sub": user.email, "type": "user"})
        return {"access_token": access_token, "token_type": "bearer", "user_type": "user", "user_id": user.id}
    
    recruiter = db.query(models.Recruiter).filter(models.Recruiter.email == form_data.username).first()
    if recruiter and auth.verify_password(form_data.password, recruiter.hashed_password):
        access_token = auth.create_access_token(data={"sub": recruiter.email, "type": "recruiter"})
        return {"access_token": access_token, "token_type": "bearer", "user_type": "recruiter", "recruiter_id": recruiter.id}
    
    raise HTTPException(status_code=401, detail="Incorrect email or password")


@app.get("/api/user/profile", response_model=schemas.UserProfileResponse)
def get_user_profile(current_user: models.User = Depends(auth.get_current_user), db: Session = Depends(get_db)):
    profile = db.query(models.UserProfile).filter(models.UserProfile.user_id == current_user.id).first()
    if not profile:
        raise HTTPException(status_code=404, detail="Profile not found")
    return profile


@app.post("/api/user/profile", response_model=schemas.UserProfileResponse)
def create_user_profile(profile: schemas.UserProfileCreate, current_user: models.User = Depends(auth.get_current_user), db: Session = Depends(get_db)):
    existing = db.query(models.UserProfile).filter(models.UserProfile.user_id == current_user.id).first()
    if existing:
        raise HTTPException(status_code=400, detail="Profile already exists. Use PUT to update.")
    
    db_profile = models.UserProfile(user_id=current_user.id, **profile.dict())
    db.add(db_profile)
    db.commit()
    db.refresh(db_profile)
    return db_profile


@app.put("/api/user/profile", response_model=schemas.UserProfileResponse)
def update_user_profile(profile: schemas.UserProfileUpdate, current_user: models.User = Depends(auth.get_current_user), db: Session = Depends(get_db)):
    db_profile = db.query(models.UserProfile).filter(models.UserProfile.user_id == current_user.id).first()
    if not db_profile:
        raise HTTPException(status_code=404, detail="Profile not found")
    
    for key, value in profile.dict(exclude_unset=True).items():
        setattr(db_profile, key, value)
    
    db.commit()
    db.refresh(db_profile)
    return db_profile


@app.post("/api/user/upload-resume")
async def upload_resume(file: UploadFile = File(...), current_user: models.User = Depends(auth.get_current_user), db: Session = Depends(get_db)):
    if not file.filename.endswith(('.pdf', '.doc', '.docx')):
        raise HTTPException(status_code=400, detail="Only PDF and DOC files allowed")
    
    file_path = f"uploads/{current_user.id}_{file.filename}"
    with open(file_path, "wb") as f:
        content = await file.read()
        f.write(content)
    
    resume_text = gemini_service.extract_text_from_file(file_path)
    
    if not resume_text or len(resume_text.strip()) < 10:
        raise HTTPException(
            status_code=400, 
            detail="Could not extract text from resume. Please ensure the file is a valid PDF or DOC file."
        )
    
    skills_data = gemini_service.extract_skills(resume_text)
    
    profile = db.query(models.UserProfile).filter(models.UserProfile.user_id == current_user.id).first()
    if profile:
        profile.resume_path = file_path
        # Combine technical and soft skills, filter out any error messages
        all_skills = []
        if skills_data.get('technical_skills'):
            all_skills.extend(skills_data['technical_skills'])
        if skills_data.get('soft_skills'):
            all_skills.extend(skills_data['soft_skills'])
        profile.extracted_skills = all_skills
        db.commit()
    
    # Return response with error info if present
    response = {
        "message": "Resume Uploaded Successfully",
        "extracted_skills": {
            "technical_skills": skills_data.get('technical_skills', []),
            "soft_skills": skills_data.get('soft_skills', [])
        }
    }
    
    # Include error message if skill extraction failed
    if skills_data.get('error'):
        response["extraction_error"] = skills_data['error']
        response["message"] = "Resume uploaded, but skill extraction had issues"
    
    return response


@app.post("/api/recruiter/jobs", response_model=schemas.JobResponse)
def create_job(job: schemas.JobCreate, current_recruiter: models.Recruiter = Depends(auth.get_current_recruiter), db: Session = Depends(get_db)):
    db_job = models.Job(recruiter_id=current_recruiter.id, **job.dict())
    db.add(db_job)
    db.commit()
    db.refresh(db_job)
    return db_job


@app.get("/api/recruiter/jobs", response_model=List[schemas.JobResponse])
def get_recruiter_jobs(current_recruiter: models.Recruiter = Depends(auth.get_current_recruiter), db: Session = Depends(get_db)):
    jobs = db.query(models.Job).filter(models.Job.recruiter_id == current_recruiter.id).all()
    return jobs


@app.put("/api/recruiter/jobs/{job_id}", response_model=schemas.JobResponseEnhanced)
def update_job(job_id: int, job: schemas.JobUpdateEnhanced, current_recruiter: models.Recruiter = Depends(auth.get_current_recruiter), db: Session = Depends(get_db)):
    db_job = db.query(models.Job).filter(models.Job.id == job_id, models.Job.recruiter_id == current_recruiter.id).first()
    if not db_job:
        raise HTTPException(status_code=404, detail="Job not found")
    
    # Update fields from the enhanced schema
    update_data = job.dict(exclude_unset=True)
    
    for key, value in update_data.items():
        # Handle enum values - convert to string if needed
        if hasattr(value, 'value'):
            value = value.value
        setattr(db_job, key, value)
    
    # Update legacy fields for backward compatibility
    if 'job_title' in update_data:
        db_job.title = update_data['job_title']
    if 'jd_text' in update_data:
        db_job.description = update_data['jd_text'][:500] if len(update_data['jd_text']) > 500 else update_data['jd_text']
    if 'location_city' in update_data or 'location_country' in update_data:
        location_parts = []
        if db_job.location_city:
            location_parts.append(db_job.location_city)
        if db_job.location_country:
            location_parts.append(db_job.location_country)
        db_job.location = ', '.join(location_parts) if location_parts else None
    
    db.commit()
    db.refresh(db_job)
    return db_job


@app.delete("/api/recruiter/jobs/{job_id}")
def close_job(job_id: int, current_recruiter: models.Recruiter = Depends(auth.get_current_recruiter), db: Session = Depends(get_db)):
    db_job = db.query(models.Job).filter(models.Job.id == job_id, models.Job.recruiter_id == current_recruiter.id).first()
    if not db_job:
        raise HTTPException(status_code=404, detail="Job not found")
    
    db_job.status = "closed"
    db.commit()
    return {"message": "Job closed successfully"}


@app.get("/api/jobs", response_model=List[schemas.JobResponse])
def get_all_jobs(skip: int = 0, limit: int = 50, db: Session = Depends(get_db)):
    # Include both "active" and "open" status for backward compatibility
    jobs = db.query(models.Job).filter(models.Job.status.in_(["active", "open"])).offset(skip).limit(limit).all()
    return jobs


# Enhanced Job Board API Endpoints
@app.post("/api/jobs", response_model=schemas.JobResponseEnhanced)
def create_job_enhanced(
    job: schemas.JobCreateEnhanced,
    current_recruiter: models.Recruiter = Depends(auth.get_current_recruiter),
    db: Session = Depends(get_db)
):
    """Create a new job posting with enhanced fields"""
    # Use company_name from recruiter if not provided
    company_name = job.company_name or current_recruiter.company_name
    
    db_job = models.Job(
        recruiter_id=current_recruiter.id,
        job_title=job.job_title,
        company_name=company_name,
        location_city=job.location_city,
        location_country=job.location_country,
        is_remote=job.is_remote,
        work_type=job.work_type,
        job_type=job.job_type,
        experience_level=job.experience_level,
        min_experience_years=job.min_experience_years,
        max_experience_years=job.max_experience_years,
        min_salary=job.min_salary,
        max_salary=job.max_salary,
        salary_currency=job.salary_currency,
        salary_pay_period=job.salary_pay_period,
        is_salary_visible=job.is_salary_visible,
        industry=job.industry,
        jd_text=job.jd_text,
        skills_required=job.skills_required or [],
        nice_to_have_skills=job.nice_to_have_skills or [],
        employment_level=job.employment_level,
        application_url=job.application_url,
        application_email=job.application_email,
        application_deadline=job.application_deadline,
        status="active",
        # Legacy fields for backward compatibility
        title=job.job_title,
        description=job.jd_text[:500] if len(job.jd_text) > 500 else job.jd_text,
        location=f"{job.location_city or ''}, {job.location_country or ''}".strip(", "),
    )
    
    db.add(db_job)
    db.commit()
    db.refresh(db_job)
    return db_job


@app.get("/api/jobs/search", response_model=dict)
def search_jobs(
    keyword: Optional[str] = Query(None),
    location_city: Optional[str] = Query(None),
    location_country: Optional[str] = Query(None),
    remote_only: Optional[bool] = Query(None),
    experience_level: Optional[str] = Query(None),  # Comma-separated
    job_type: Optional[str] = Query(None),  # Comma-separated
    work_type: Optional[str] = Query(None),  # Comma-separated
    min_salary: Optional[int] = Query(None),
    max_salary: Optional[int] = Query(None),
    industry: Optional[str] = Query(None),  # Comma-separated
    skills_required: Optional[str] = Query(None),  # Comma-separated
    posted_within: Optional[str] = Query("any"),  # "1", "7", "30", "any"
    sort_by: Optional[str] = Query("newest"),  # "newest", "salary_high", "relevance"
    skip: int = Query(0, ge=0),
    limit: int = Query(20, ge=1, le=100),
    db: Session = Depends(get_db)
):
    """Search and filter jobs with pagination"""
    # Include both "active" and "open" status for backward compatibility
    query = db.query(models.Job).filter(models.Job.status.in_(["active", "open"]))
    
    # Keyword search
    if keyword:
        keyword_filter = or_(
            models.Job.job_title.ilike(f"%{keyword}%"),
            models.Job.company_name.ilike(f"%{keyword}%"),
            models.Job.jd_text.ilike(f"%{keyword}%"),
            models.Job.industry.ilike(f"%{keyword}%")
        )
        query = query.filter(keyword_filter)
    
    # Location filters
    if location_city:
        query = query.filter(models.Job.location_city.ilike(f"%{location_city}%"))
    if location_country:
        query = query.filter(models.Job.location_country.ilike(f"%{location_country}%"))
    if remote_only:
        query = query.filter(models.Job.is_remote == True)
    
    # Experience level filter
    if experience_level:
        levels = [l.strip() for l in experience_level.split(",")]
        query = query.filter(models.Job.experience_level.in_(levels))
    
    # Job type filter
    if job_type:
        types = [t.strip() for t in job_type.split(",")]
        query = query.filter(models.Job.job_type.in_(types))
    
    # Work type filter
    if work_type:
        types = [t.strip() for t in work_type.split(",")]
        query = query.filter(models.Job.work_type.in_(types))
    
    # Salary filters
    if min_salary:
        query = query.filter(
            or_(
                models.Job.max_salary >= min_salary,
                models.Job.min_salary >= min_salary
            )
        )
    if max_salary:
        query = query.filter(
            or_(
                models.Job.min_salary <= max_salary,
                models.Job.max_salary <= max_salary
            )
        )
    
    # Industry filter
    if industry:
        industries = [i.strip() for i in industry.split(",")]
        query = query.filter(models.Job.industry.in_(industries))
    
    # Skills filter - simplified for SQLite
    if skills_required:
        skills = [s.strip().lower() for s in skills_required.split(",")]
        # For SQLite, we'll do a simple text search in the JSON array
        # This is a simplified approach - for production, consider full-text search
        for skill in skills:
            query = query.filter(
                func.lower(func.cast(models.Job.skills_required, String)).contains(skill)
            )
    
    # Posted within filter
    if posted_within and posted_within != "any":
        days = int(posted_within)
        cutoff_date = datetime.utcnow() - timedelta(days=days)
        query = query.filter(models.Job.created_at >= cutoff_date)
    
    # Sorting
    if sort_by == "salary_high":
        query = query.order_by(models.Job.max_salary.desc().nulls_last())
    elif sort_by == "relevance":
        query = query.order_by(models.Job.created_at.desc())
    else:  # newest (default)
        query = query.order_by(models.Job.created_at.desc())
    
    # Get total count before pagination
    total = query.count()
    
    # Pagination
    jobs = query.offset(skip).limit(limit).all()
    
    # Ensure old jobs have required fields populated for display
    for job in jobs:
        if not job.job_title and job.title:
            job.job_title = job.title
        if not job.jd_text and job.description:
            job.jd_text = job.description
        if not job.company_name:
            job.company_name = "Company Not Specified"
        # Set defaults for new fields if missing
        if not job.work_type:
            job.work_type = "onsite"
        if not job.job_type:
            job.job_type = "full_time"
        if job.experience_level is None:
            job.experience_level = "fresher"
    
    return {
        "jobs": jobs,
        "total": total,
        "skip": skip,
        "limit": limit,
        "has_more": (skip + limit) < total
    }


@app.get("/api/jobs/{job_id}", response_model=schemas.JobResponseEnhanced)
def get_job_by_id(job_id: int, db: Session = Depends(get_db)):
    """Get a single job by ID"""
    job = db.query(models.Job).filter(models.Job.id == job_id).first()
    if not job:
        raise HTTPException(status_code=404, detail="Job not found")
    return job


@app.post("/api/jobs/{job_id}/generate-roadmap")
def generate_job_roadmap_endpoint(
    job_id: int,
    current_recruiter: models.Recruiter = Depends(auth.get_current_recruiter),
    db: Session = Depends(get_db)
):
    """Generate AI roadmap for a job (recruiter can generate template roadmap)"""
    job = db.query(models.Job).filter(
        models.Job.id == job_id,
        models.Job.recruiter_id == current_recruiter.id
    ).first()
    
    if not job:
        raise HTTPException(status_code=404, detail="Job not found")
    
    # Create a generic user profile for template roadmap
    generic_user = {
        "name": "Generic Candidate",
        "degree": "B.Tech/B.E.",
        "experience_years": job.min_experience_years or 0,
        "technical_skills": [],
        "soft_skills": [],
        "certifications": [],
        "achievements": [],
        "target_career": job.job_title or job.title
    }
    
    # Convert job to dict format
    job_dict = {
        "id": job.id,
        "job_title": job.job_title or job.title,
        "company_name": job.company_name,
        "jd_text": job.jd_text or job.description or "",
        "location_city": job.location_city,
        "location_country": job.location_country,
        "work_type": job.work_type,
        "job_type": job.job_type,
        "experience_level": job.experience_level,
        "min_experience_years": job.min_experience_years,
        "max_experience_years": job.max_experience_years,
        "skills_required": job.skills_required if isinstance(job.skills_required, list) else [],
        "nice_to_have_skills": job.nice_to_have_skills if isinstance(job.nice_to_have_skills, list) else [],
        "industry": job.industry,
    }
    
    result = generate_job_roadmap(job_dict, generic_user)
    
    if result.get("error"):
        raise HTTPException(status_code=503, detail=result["error"])
    
    # Save roadmap to job
    job.roadmap_json = result.get("roadmap")
    db.commit()
    
    return {
        "job_id": job_id,
        "roadmap": result.get("roadmap"),
        "message": "Roadmap generated successfully"
    }


@app.post("/api/jobs/{job_id}/generate-roadmap-for-user")
def generate_job_roadmap_for_user(
    job_id: int,
    current_user: models.User = Depends(auth.get_current_user),
    db: Session = Depends(get_db)
):
    """Generate personalized AI roadmap for a specific job and user"""
    job = db.query(models.Job).filter(models.Job.id == job_id).first()
    if not job:
        raise HTTPException(status_code=404, detail="Job not found")
    
    # Get user profile
    profile = db.query(models.UserProfile).filter(models.UserProfile.user_id == current_user.id).first()
    if not profile:
        raise HTTPException(status_code=404, detail="User profile not found. Please complete your profile first.")
    
    # Prepare user profile data
    all_skills = (profile.skills or []) + (profile.extracted_skills or [])
    # Separate technical and soft skills (basic heuristic)
    technical_keywords = ['python', 'java', 'react', 'node', 'sql', 'aws', 'docker', 'javascript', 'html', 'css', 'api', 'database', 'cloud', 'ml', 'ai', 'typescript', 'angular', 'vue', 'mongodb', 'postgres', 'redis', 'kubernetes', 'git', 'linux', 'tensorflow', 'pytorch']
    technical_skills = [s for s in all_skills if any(tech in s.lower() for tech in technical_keywords)]
    soft_skills = [s for s in all_skills if s not in technical_skills]
    
    # Collect semester CGPA values
    semester_cgpas = []
    for sem in range(1, 9):
        cgpa_value = getattr(profile, f'cgpa_sem{sem}', None)
        if cgpa_value:
            semester_cgpas.append(f"Semester {sem}: {cgpa_value}")
    
    user_profile = {
        "name": current_user.full_name,
        "degree": profile.degree or "N/A",
        "course": profile.course or "N/A",
        "cgpa_10th": profile.cgpa_10th,
        "cgpa_12th": profile.cgpa_12th,
        "total_cgpa": profile.total_cgpa,
        "semester_cgpas": semester_cgpas,
        "cgpa_sem1": profile.cgpa_sem1,
        "cgpa_sem2": profile.cgpa_sem2,
        "cgpa_sem3": profile.cgpa_sem3,
        "cgpa_sem4": profile.cgpa_sem4,
        "cgpa_sem5": profile.cgpa_sem5,
        "cgpa_sem6": profile.cgpa_sem6,
        "cgpa_sem7": profile.cgpa_sem7,
        "cgpa_sem8": profile.cgpa_sem8,
        "experience_years": 0,  # Could be calculated from profile if available
        "current_role": "Student",
        "technical_skills": technical_skills,
        "soft_skills": soft_skills,
        "certifications": profile.certifications or [],
        "achievements": profile.achievements or [],
        "target_career": job.job_title or job.title or "Software Engineer"
    }
    
    # Convert job to dict format
    job_dict = {
        "id": job.id,
        "job_title": job.job_title or job.title,
        "company_name": job.company_name,
        "jd_text": job.jd_text or job.description or "",
        "location_city": job.location_city,
        "location_country": job.location_country,
        "work_type": job.work_type,
        "job_type": job.job_type,
        "experience_level": job.experience_level,
        "min_experience_years": job.min_experience_years,
        "max_experience_years": job.max_experience_years,
        "skills_required": job.skills_required if isinstance(job.skills_required, list) else [],
        "nice_to_have_skills": job.nice_to_have_skills if isinstance(job.nice_to_have_skills, list) else [],
        "industry": job.industry,
    }
    
    # Generate roadmap
    result = generate_job_roadmap(job_dict, user_profile)
    
    if result.get("error"):
        raise HTTPException(status_code=503, detail=result["error"])
    
    return {
        "job_id": job_id,
        "job_title": job.job_title or job.title,
        "roadmap": result.get("roadmap"),
        "message": "Personalized roadmap generated successfully"
    }


@app.post("/api/ai/recommend-careers")
def recommend_careers(current_user: models.User = Depends(auth.get_current_user), db: Session = Depends(get_db)):
    profile = db.query(models.UserProfile).filter(models.UserProfile.user_id == current_user.id).first()
    if not profile:
        raise HTTPException(status_code=404, detail="Profile not found")
    
    all_skills = (profile.skills or []) + (profile.extracted_skills or [])
    
    if not all_skills:
        raise HTTPException(status_code=400, detail="No skills found in profile. Please add skills or upload a resume first.")
    
    recommendations = ml_service.recommend_careers_knn(all_skills)
    
    if not recommendations:
        raise HTTPException(status_code=503, detail="Career recommendation service is unavailable. ML models may not be loaded properly.")
    
    return {"careers": recommendations}


@app.post("/api/ai/match-jobs")
def match_jobs(current_user: models.User = Depends(auth.get_current_user), db: Session = Depends(get_db)):
    """Match jobs from database using user profile and resume"""
    profile = db.query(models.UserProfile).filter(models.UserProfile.user_id == current_user.id).first()
    if not profile:
        raise HTTPException(status_code=404, detail="Profile not found. Please complete your profile first.")
    
    # Get all active jobs from database
    jobs_from_db = db.query(models.Job).filter(
        models.Job.status.in_(["active", "open"])
    ).all()
    
    if not jobs_from_db:
        return {"jobs": [], "message": "No jobs available in the database"}
    
    # Build user profile text
    user_profile_parts = []
    
    if profile.degree:
        user_profile_parts.append(f"Degree: {profile.degree}")
    if profile.course:
        user_profile_parts.append(f"Course: {profile.course}")
    if profile.cgpa_10th:
        user_profile_parts.append(f"10th CGPA: {profile.cgpa_10th}")
    if profile.cgpa_12th:
        user_profile_parts.append(f"12th CGPA: {profile.cgpa_12th}")
    if profile.total_cgpa:
        user_profile_parts.append(f"Total CGPA: {profile.total_cgpa}")
    
    # Add semester CGPA values
    semester_cgpas = []
    for sem in range(1, 9):
        cgpa_value = getattr(profile, f'cgpa_sem{sem}', None)
        if cgpa_value:
            semester_cgpas.append(f"Sem {sem}: {cgpa_value}")
    if semester_cgpas:
        user_profile_parts.append(f"Semester CGPA: {', '.join(semester_cgpas)}")
    
    # Add skills
    all_skills = []
    if profile.skills:
        all_skills.extend(profile.skills if isinstance(profile.skills, list) else [profile.skills])
    if profile.extracted_skills:
        all_skills.extend(profile.extracted_skills if isinstance(profile.extracted_skills, list) else [profile.extracted_skills])
    
    if all_skills:
        user_profile_parts.append(f"Skills: {', '.join(all_skills)}")
    
    # Add certifications
    if profile.certifications:
        certs = profile.certifications if isinstance(profile.certifications, list) else [profile.certifications]
        user_profile_parts.append(f"Certifications: {', '.join(certs)}")
    
    # Add achievements
    if profile.achievements:
        achievements = profile.achievements if isinstance(profile.achievements, list) else [profile.achievements]
        user_profile_parts.append(f"Achievements: {', '.join(achievements)}")
    
    # Extract resume text if available
    resume_text = ""
    if profile.resume_path:
        try:
            resume_text = gemini_service.extract_text_from_file(profile.resume_path)
        except Exception as e:
            print(f"Warning: Could not extract resume text: {e}")
            resume_text = ""
    
    # Combine all user information
    combined_text = " ".join(user_profile_parts)
    if resume_text and len(resume_text.strip()) > 10:
        combined_text += f" Resume: {resume_text[:2000]}"  # Limit resume text to avoid too long input
    
    if not combined_text or len(combined_text.strip()) < 10:
        raise HTTPException(
            status_code=400, 
            detail="Insufficient profile information. Please add skills, upload a resume, or complete your profile."
        )
    
    # Match jobs from database
    matched_jobs = ml_service.match_jobs_from_database(combined_text, jobs_from_db, top_k=20)
    
    if not matched_jobs:
        # Fallback: return jobs sorted by creation date if ML matching fails
        return {
            "jobs": [],
            "message": "Job matching service is temporarily unavailable. Please browse jobs manually.",
            "fallback_available": True
        }
    
    return {
        "jobs": matched_jobs,
        "total_matched": len(matched_jobs),
        "message": f"Found {len(matched_jobs)} matching jobs"
    }


@app.post("/api/ai/generate-roadmap")
def generate_roadmap(request: schemas.RoadmapRequest, current_user: models.User = Depends(auth.get_current_user), db: Session = Depends(get_db)):
    """DEPRECATED: This endpoint is deprecated. Use job-based roadmap generation instead."""
    raise HTTPException(
        status_code=410, 
        detail="This endpoint is deprecated. Please generate roadmaps from job listings using /api/jobs/{job_id}/generate-roadmap-for-user"
    )


@app.post("/api/roadmaps/save", response_model=schemas.RoadmapResponse)
def save_roadmap(request: schemas.RoadmapSaveRequest, current_user: models.User = Depends(auth.get_current_user), db: Session = Depends(get_db)):
    """Save a roadmap. Users can have maximum 3 saved roadmaps. If limit reached, oldest is deleted."""
    # Get current roadmaps count
    existing_roadmaps = db.query(models.Roadmap).filter(
        models.Roadmap.user_id == current_user.id
    ).order_by(models.Roadmap.created_at.asc()).all()
    
    # If user has 3 or more roadmaps, delete the oldest one
    if len(existing_roadmaps) >= 3:
        oldest_roadmap = existing_roadmaps[0]
        db.delete(oldest_roadmap)
        db.commit()
    
    # Create new roadmap
    db_roadmap = models.Roadmap(
        user_id=current_user.id,
        title=request.title,
        roadmap_data=request.roadmap_data,
        job_id=request.job_id,
        roadmap_type=request.roadmap_type,
        target_career=request.target_career
    )
    db.add(db_roadmap)
    db.commit()
    db.refresh(db_roadmap)
    
    return db_roadmap


@app.get("/api/roadmaps", response_model=List[schemas.RoadmapResponse])
def get_saved_roadmaps(current_user: models.User = Depends(auth.get_current_user), db: Session = Depends(get_db)):
    """Get all saved roadmaps for the current user (max 3)."""
    roadmaps = db.query(models.Roadmap).filter(
        models.Roadmap.user_id == current_user.id
    ).order_by(models.Roadmap.created_at.desc()).limit(3).all()
    
    return roadmaps


@app.delete("/api/roadmaps/{roadmap_id}")
def delete_roadmap(roadmap_id: int, current_user: models.User = Depends(auth.get_current_user), db: Session = Depends(get_db)):
    """Delete a saved roadmap."""
    roadmap = db.query(models.Roadmap).filter(
        models.Roadmap.id == roadmap_id,
        models.Roadmap.user_id == current_user.id
    ).first()
    
    if not roadmap:
        raise HTTPException(status_code=404, detail="Roadmap not found")
    
    db.delete(roadmap)
    db.commit()
    
    return {"message": "Roadmap deleted successfully"}


@app.post("/api/ai/skill-gap-analysis")
def skill_gap_analysis(current_user: models.User = Depends(auth.get_current_user), db: Session = Depends(get_db)):
    profile = db.query(models.UserProfile).filter(models.UserProfile.user_id == current_user.id).first()
    if not profile:
        raise HTTPException(status_code=404, detail="Profile not found")
    
    user_skills = (profile.skills or []) + (profile.extracted_skills or [])
    career_recommendations = ml_service.recommend_careers_knn(user_skills, top_k=1)
    required_skills = career_recommendations[0]['required_skills'] if career_recommendations else []
    
    gap_analysis = gemini_service.analyze_skill_gap(user_skills, required_skills)
    
    # Check for errors
    if gap_analysis.get("error"):
        raise HTTPException(status_code=503, detail=gap_analysis["error"])
    
    return gap_analysis


@app.post("/api/ai/strengths-weaknesses")
def strengths_weaknesses(current_user: models.User = Depends(auth.get_current_user), db: Session = Depends(get_db)):
    profile = db.query(models.UserProfile).filter(models.UserProfile.user_id == current_user.id).first()
    if not profile:
        raise HTTPException(status_code=404, detail="Profile not found")
    
    analysis = gemini_service.analyze_strengths_weaknesses(profile.__dict__)
    
    # Check for errors
    if analysis.get("error"):
        raise HTTPException(status_code=503, detail=analysis["error"])
    
    return analysis


@app.post("/api/roadmaps/{roadmap_id}/tasks/{task_id}/regenerate")
def regenerate_roadmap_task(
    roadmap_id: int,
    task_id: str,
    feedback: schemas.TaskFeedback,
    current_user: models.User = Depends(auth.get_current_user),
    db: Session = Depends(get_db)
):
    """
    Regenerate a specific task in a roadmap based on user feedback (e.g., 'skip', 'too_hard').
    """
    # 1. Fetch Roadmap
    roadmap = db.query(models.Roadmap).filter(
        models.Roadmap.id == roadmap_id,
        models.Roadmap.user_id == current_user.id
    ).first()
    
    if not roadmap:
        raise HTTPException(status_code=404, detail="Roadmap not found")
        
    roadmap_data = roadmap.roadmap_data
    if not roadmap_data or "roadmap" not in roadmap_data:
        raise HTTPException(status_code=400, detail="Invalid roadmap data structure")
        
    # 2. Find the Task to Regenerate
    target_phase = None
    target_task_index = -1
    found_task = None
    
    for phase in roadmap_data["roadmap"]["phases"]:
        for idx, task in enumerate(phase["tasks"]):
            # Check by ID if available, otherwise fallback to title matching (legacy)
            if task.get("task_id") == task_id or task.get("title") == task_id:
                target_phase = phase
                target_task_index = idx
                found_task = task
                break
        if found_task:
            break
            
    if not found_task:
        raise HTTPException(status_code=404, detail="Task not found in roadmap")
        
    # 3. Call AI to Regenerate
    from app.job_roadmap_service import regenerate_task
    
    new_task = regenerate_task(found_task["title"], feedback.feedback_type)
    
    if new_task.get("error"):
        raise HTTPException(status_code=503, detail=new_task["error"])
        
    # 4. Update Roadmap Data
    # Replace the old task with the new one
    target_phase["tasks"][target_task_index] = new_task
    
    # Check if we need to update the flag to force SQLAlchemy to detect change in JSON
    from sqlalchemy.orm.attributes import flag_modified
    roadmap.roadmap_data = roadmap_data
    flag_modified(roadmap, "roadmap_data")
    
    db.commit()
    db.refresh(roadmap)
    
    return {
        "roadmap_id": roadmap_id,
        "new_task": new_task,
        "message": "Task regenerated successfully"
    }


@app.post("/api/ai/chat")
def chat(request: schemas.ChatRequest, current_user: models.User = Depends(auth.get_current_user)):
    chat_result = gemini_service.chat_with_context(request.message, {"name": current_user.full_name})
    
    # Check for errors
    if chat_result.get("error"):
        raise HTTPException(status_code=503, detail=chat_result["error"])
    
    return {"response": chat_result.get("response", "")}


@app.get("/")
def root():
    return {"message": "PathFinder AI API", "status": "running"}


if __name__ == "__main__":
    uvicorn.run("main:app", port=8001, reload=True)