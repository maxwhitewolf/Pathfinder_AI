import joblib
import numpy as np
from gensim.models.doc2vec import Doc2Vec
from gensim.utils import simple_preprocess
from sklearn.metrics.pairwise import cosine_similarity
import pickle
import os
from pathlib import Path

# Get the base directory (backend folder)
BASE_DIR = Path(__file__).resolve().parent.parent
ML_MODELS_DIR = BASE_DIR / 'ml_models'

# Load models
try:
    KNN_MODEL = joblib.load(ML_MODELS_DIR / 'knn_career_model.pkl')
    MLB = joblib.load(ML_MODELS_DIR / 'skills_mlb.pkl')
    CAREER_REF = joblib.load(ML_MODELS_DIR / 'career_reference.pkl')
    DOC2VEC_MODEL = Doc2Vec.load(str(ML_MODELS_DIR / 'doc2vec_job_model.model'))
    JOB_VECTORS = joblib.load(ML_MODELS_DIR / 'job_vectors.pkl')
    JOB_METADATA = joblib.load(ML_MODELS_DIR / 'job_metadata.pkl')
    
    try:
        with open(ML_MODELS_DIR / 'contextual_bandit.pkl', 'rb') as f:
            BANDIT_DATA = pickle.load(f)
    except:
        BANDIT_DATA = None
        
    print("✓ ML models loaded successfully")
except Exception as e:
    print(f"Warning: Could not load ML models: {e}")
    print(f"ML models directory: {ML_MODELS_DIR}")
    print(f"Directory exists: {ML_MODELS_DIR.exists()}")
    if ML_MODELS_DIR.exists():
        print(f"Files in directory: {list(ML_MODELS_DIR.glob('*'))}")
    KNN_MODEL = None
    MLB = None
    CAREER_REF = None
    DOC2VEC_MODEL = None
    JOB_VECTORS = None
    JOB_METADATA = None
    BANDIT_DATA = None


def recommend_careers_knn(user_skills, top_k=5):
    """Recommend careers using KNN"""
    if not KNN_MODEL or not MLB or CAREER_REF is None:
        error_msg = f"Error: Required ML models not loaded. KNN_MODEL: {KNN_MODEL is not None}, MLB: {MLB is not None}, CAREER_REF: {CAREER_REF is not None}"
        print(error_msg)
        return []
    
    try:
        user_skills_encoded = MLB.transform([user_skills])
        distances, indices = KNN_MODEL.kneighbors(
            user_skills_encoded, 
            n_neighbors=min(top_k, len(CAREER_REF))
        )
        
        recommendations = []
        for dist, idx in zip(distances[0], indices[0]):
            similarity = 1 - dist
            career = CAREER_REF.iloc[idx]['Career']
            career_skills = CAREER_REF.iloc[idx]['Skills']
            
            matching_skills = set(user_skills) & set(career_skills)
            missing_skills = set(career_skills) - set(user_skills)
            
            recommendations.append({
                'career': career,
                'similarity_score': round(similarity * 100, 2),
                'matching_skills': list(matching_skills),
                'missing_skills': list(missing_skills)[:5],
                'required_skills': career_skills
            })
        
        return recommendations
    except Exception as e:
        print(f"Error in KNN recommendation: {e}")
        import traceback
        traceback.print_exc()
        return []


def match_jobs_doc2vec(resume_text, top_k=10):
    """Match jobs using Doc2Vec (legacy - uses pre-trained job vectors)"""
    if not DOC2VEC_MODEL:
        return []
    
    try:
        resume_tokens = simple_preprocess(resume_text, deacc=True, min_len=2, max_len=15)
        resume_vector = DOC2VEC_MODEL.infer_vector(resume_tokens, epochs=20)
        resume_vector = resume_vector.reshape(1, -1)
        
        similarities = cosine_similarity(resume_vector, JOB_VECTORS)[0]
        top_indices = np.argsort(similarities)[-top_k:][::-1]
        
        results = []
        for idx in top_indices:
            job = JOB_METADATA.iloc[idx]
            results.append({
                'job_id': int(job['ID_num']),
                'job_title': job['job_title'],
                'description': job['Short_description'],
                'skills_required': job['Skills_required'],
                'industry': job['Industry'],
                'pay_grade': job['Pay_grade'],
                'match_score': round(float(similarities[idx]) * 100, 2)
            })
        
        return results
    except Exception as e:
        print(f"Error in Doc2Vec matching: {e}")
        return []


def match_jobs_from_database(resume_text, jobs_from_db, top_k=10):
    """
    Match jobs from database using Doc2Vec
    
    Args:
        resume_text: Combined text from user profile and resume
        jobs_from_db: List of Job model objects from database
        top_k: Number of top matches to return
    
    Returns:
        List of matched jobs with match scores
    """
    if not DOC2VEC_MODEL:
        print("Warning: Doc2Vec model not loaded")
        return []
    
    if not jobs_from_db or len(jobs_from_db) == 0:
        return []
    
    try:
        # Create embedding for user resume/profile
        resume_tokens = simple_preprocess(resume_text, deacc=True, min_len=2, max_len=15)
        resume_vector = DOC2VEC_MODEL.infer_vector(resume_tokens, epochs=20)
        resume_vector = resume_vector.reshape(1, -1)
        
        # Create embeddings for all jobs in database
        job_texts = []
        job_objects = []
        
        for job in jobs_from_db:
            # Combine job information into a single text
            job_text_parts = []
            
            if job.job_title:
                job_text_parts.append(job.job_title)
            if job.jd_text:
                job_text_parts.append(job.jd_text)
            elif job.description:
                job_text_parts.append(job.description)
            if job.skills_required:
                if isinstance(job.skills_required, list):
                    job_text_parts.append(" ".join(job.skills_required))
                else:
                    job_text_parts.append(str(job.skills_required))
            if job.nice_to_have_skills:
                if isinstance(job.nice_to_have_skills, list):
                    job_text_parts.append(" ".join(job.nice_to_have_skills))
            if job.industry:
                job_text_parts.append(job.industry)
            if job.experience_level:
                job_text_parts.append(job.experience_level)
            
            job_text = " ".join(job_text_parts)
            if job_text.strip():
                job_texts.append(job_text)
                job_objects.append(job)
        
        if not job_texts:
            return []
        
        # Create embeddings for all jobs
        job_vectors = []
        for job_text in job_texts:
            job_tokens = simple_preprocess(job_text, deacc=True, min_len=2, max_len=15)
            job_vector = DOC2VEC_MODEL.infer_vector(job_tokens, epochs=20)
            job_vectors.append(job_vector)
        
        job_vectors = np.array(job_vectors)
        
        # Calculate similarity scores
        similarities = cosine_similarity(resume_vector, job_vectors)[0]
        
        # Get top k matches
        top_indices = np.argsort(similarities)[-top_k:][::-1]
        
        # Build results
        results = []
        for idx in top_indices:
            job = job_objects[idx]
            similarity_score = float(similarities[idx])
            
            # Calculate skill match percentage
            skill_match = 0
            matching_skills_list = []
            
            if resume_text and job.skills_required:
                resume_lower = resume_text.lower()
                job_skills = set(job.skills_required) if isinstance(job.skills_required, list) else set([str(job.skills_required)])
                
                # Check if any job skills appear in resume
                matching_skills_list = [skill for skill in job_skills if skill.lower() in resume_lower]
                skill_match = len(matching_skills_list) / len(job_skills) * 100 if job_skills else 0
            
            # Combine similarity score with skill match (weighted)
            # Similarity score is already 0-1, so multiply by 100 for percentage
            final_score = (similarity_score * 0.7 + (skill_match / 100) * 0.3) * 100
            
            results.append({
                'job_id': job.id,
                'job_title': job.job_title or job.title or 'Untitled Job',
                'company_name': job.company_name or 'Company Not Specified',
                'description': (job.jd_text or job.description or '')[:200] + '...' if (job.jd_text or job.description) else '',
                'jd_text': job.jd_text or job.description or '',
                'skills_required': job.skills_required if isinstance(job.skills_required, list) else ([] if not job.skills_required else [str(job.skills_required)]),
                'nice_to_have_skills': job.nice_to_have_skills if isinstance(job.nice_to_have_skills, list) else [],
                'industry': job.industry,
                'location_city': job.location_city,
                'location_country': job.location_country,
                'is_remote': job.is_remote or False,
                'work_type': job.work_type,
                'job_type': job.job_type,
                'experience_level': job.experience_level,
                'min_salary': job.min_salary,
                'max_salary': job.max_salary,
                'salary_currency': job.salary_currency,
                'match_score': round(final_score, 2),  # Overall match score (0-100)
                'similarity_score': round(similarity_score, 4),  # Doc2Vec similarity (0-1) for frontend compatibility
                'skill_match_percentage': round(skill_match, 2),
                'matching_skills': matching_skills_list,
                # Legacy fields for backward compatibility
                'location': f"{job.location_city or ''}, {job.location_country or ''}".strip(", ") or None,
                'salary': job.salary if hasattr(job, 'salary') else None,
                'title': job.job_title or job.title,
                'Short_description': (job.jd_text or job.description or '')[:200],  # For legacy compatibility
                'Skills_required': job.skills_required if isinstance(job.skills_required, list) else ([] if not job.skills_required else [str(job.skills_required)]),
                'Industry': job.industry,
                'Pay_grade': None  # Not available in new schema
            })
        
        return results
    except Exception as e:
        print(f"Error in database job matching: {e}")
        import traceback
        traceback.print_exc()
        return []


def select_best_roadmap(roadmaps, user_profile):
    """Select best roadmap using Contextual Bandit"""
    if not roadmaps or len(roadmaps) == 0:
        return None
    
    if not BANDIT_DATA:
        # Default: return balanced path (variant 2)
        return roadmaps[1] if len(roadmaps) > 1 else roadmaps[0]
    
    try:
        # Simple selection based on experience level
        exp_level = user_profile.get('experience_level', 'beginner')
        
        if exp_level == 'beginner' and len(roadmaps) > 2:
            return roadmaps[2]  # Self-paced
        elif exp_level == 'advanced' and len(roadmaps) > 0:
            return roadmaps[0]  # Fast-track
        else:
            return roadmaps[1] if len(roadmaps) > 1 else roadmaps[0]  # Balanced
    except:
        return roadmaps[0]


def update_bandit_feedback(variant_id, rating, user_context):
    """Update bandit with user feedback"""
    # In production, this would update the bandit model
    # For now, we'll just log it
    print(f"Feedback received: Variant {variant_id}, Rating {rating}")
    pass