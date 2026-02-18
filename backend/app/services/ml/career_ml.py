"""
Career ML: KNN career recommendation, Doc2Vec job matching.
Uses app.config for ML_MODELS_DIR.
"""
import pickle
import joblib
import numpy as np
from gensim.models.doc2vec import Doc2Vec
from gensim.utils import simple_preprocess
from sklearn.metrics.pairwise import cosine_similarity

from app.config import ML_MODELS_DIR

try:
    KNN_MODEL = joblib.load(ML_MODELS_DIR / "knn_career_model.pkl")
    MLB = joblib.load(ML_MODELS_DIR / "skills_mlb.pkl")
    CAREER_REF = joblib.load(ML_MODELS_DIR / "career_reference.pkl")
    DOC2VEC_MODEL = Doc2Vec.load(str(ML_MODELS_DIR / "doc2vec_job_model.model"))
    JOB_VECTORS = joblib.load(ML_MODELS_DIR / "job_vectors.pkl")
    JOB_METADATA = joblib.load(ML_MODELS_DIR / "job_metadata.pkl")
    try:
        with open(ML_MODELS_DIR / "contextual_bandit.pkl", "rb") as f:
            BANDIT_DATA = pickle.load(f)
    except Exception:
        BANDIT_DATA = None
    print("ML models loaded successfully")
except Exception as e:
    print(f"Warning: Could not load ML models: {e}")
    KNN_MODEL = MLB = CAREER_REF = None
    DOC2VEC_MODEL = JOB_VECTORS = JOB_METADATA = BANDIT_DATA = None


def recommend_careers_knn(user_skills, top_k=5):
    if not KNN_MODEL or not MLB or CAREER_REF is None:
        return []
    try:
        user_skills_encoded = MLB.transform([user_skills])
        distances, indices = KNN_MODEL.kneighbors(
            user_skills_encoded, n_neighbors=min(top_k, len(CAREER_REF))
        )
        recommendations = []
        for dist, idx in zip(distances[0], indices[0]):
            similarity = 1 - dist
            career = CAREER_REF.iloc[idx]["Career"]
            career_skills = CAREER_REF.iloc[idx]["Skills"]
            matching_skills = set(user_skills) & set(career_skills)
            missing_skills = set(career_skills) - set(user_skills)
            recommendations.append({
                "career": career,
                "similarity_score": round(similarity * 100, 2),
                "matching_skills": list(matching_skills),
                "missing_skills": list(missing_skills)[:5],
                "required_skills": career_skills,
            })
        return recommendations
    except Exception as e:
        print(f"Error in KNN recommendation: {e}")
        return []


def match_jobs_doc2vec(resume_text, top_k=10):
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
                "job_id": int(job["ID_num"]),
                "job_title": job["job_title"],
                "description": job["Short_description"],
                "skills_required": job["Skills_required"],
                "industry": job["Industry"],
                "pay_grade": job["Pay_grade"],
                "match_score": round(float(similarities[idx]) * 100, 2),
            })
        return results
    except Exception as e:
        print(f"Error in Doc2Vec matching: {e}")
        return []


def match_jobs_from_database(resume_text, jobs_from_db, top_k=10):
    if not DOC2VEC_MODEL or not jobs_from_db:
        return []
    try:
        resume_tokens = simple_preprocess(resume_text, deacc=True, min_len=2, max_len=15)
        resume_vector = DOC2VEC_MODEL.infer_vector(resume_tokens, epochs=20)
        resume_vector = resume_vector.reshape(1, -1)
        job_texts, job_objects = [], []
        for job in jobs_from_db:
            parts = []
            if job.job_title:
                parts.append(job.job_title)
            if job.jd_text:
                parts.append(job.jd_text)
            elif job.description:
                parts.append(job.description)
            if job.skills_required:
                parts.append(" ".join(job.skills_required) if isinstance(job.skills_required, list) else str(job.skills_required))
            if job.nice_to_have_skills and isinstance(job.nice_to_have_skills, list):
                parts.append(" ".join(job.nice_to_have_skills))
            if job.industry:
                parts.append(job.industry)
            if job.experience_level:
                parts.append(job.experience_level)
            text = " ".join(parts)
            if text.strip():
                job_texts.append(text)
                job_objects.append(job)
        if not job_texts:
            return []
        job_vectors = np.array([
            DOC2VEC_MODEL.infer_vector(simple_preprocess(t, deacc=True, min_len=2, max_len=15), epochs=20)
            for t in job_texts
        ])
        similarities = cosine_similarity(resume_vector, job_vectors)[0]
        top_indices = np.argsort(similarities)[-top_k:][::-1]
        results = []
        for idx in top_indices:
            job = job_objects[idx]
            sim = float(similarities[idx])
            resume_lower = resume_text.lower()
            job_skills = set(job.skills_required) if isinstance(job.skills_required, list) else {str(job.skills_required)}
            matching = [s for s in job_skills if s.lower() in resume_lower]
            skill_match = len(matching) / len(job_skills) * 100 if job_skills else 0
            final_score = (sim * 0.7 + (skill_match / 100) * 0.3) * 100
            results.append({
                "job_id": job.id,
                "job_title": job.job_title or job.title or "Untitled Job",
                "company_name": job.company_name or "Company Not Specified",
                "description": (job.jd_text or job.description or "")[:200] + "..." if (job.jd_text or job.description) else "",
                "jd_text": job.jd_text or job.description or "",
                "skills_required": job.skills_required if isinstance(job.skills_required, list) else [],
                "nice_to_have_skills": job.nice_to_have_skills if isinstance(job.nice_to_have_skills, list) else [],
                "industry": job.industry,
                "location_city": job.location_city,
                "location_country": job.location_country,
                "is_remote": job.is_remote or False,
                "work_type": job.work_type,
                "job_type": job.job_type,
                "experience_level": job.experience_level,
                "min_salary": job.min_salary,
                "max_salary": job.max_salary,
                "salary_currency": job.salary_currency,
                "match_score": round(final_score, 2),
                "similarity_score": round(sim, 4),
                "skill_match_percentage": round(skill_match, 2),
                "matching_skills": matching,
                "location": f"{job.location_city or ''}, {job.location_country or ''}".strip(", ") or None,
                "salary": getattr(job, "salary", None),
                "title": job.job_title or job.title,
                "Short_description": (job.jd_text or job.description or "")[:200] if (job.jd_text or job.description) else "",
                "Skills_required": job.skills_required if isinstance(job.skills_required, list) else ([] if not job.skills_required else [str(job.skills_required)]),
                "Industry": job.industry,
                "Pay_grade": None,
            })
        return results
    except Exception as e:
        print(f"Error in database job matching: {e}")
        return []


def select_best_roadmap(roadmaps, user_profile):
    if not roadmaps:
        return None
    if not BANDIT_DATA:
        return roadmaps[1] if len(roadmaps) > 1 else roadmaps[0]
    try:
        exp_level = user_profile.get("experience_level", "beginner")
        if exp_level == "beginner" and len(roadmaps) > 2:
            return roadmaps[2]
        if exp_level == "advanced" and roadmaps:
            return roadmaps[0]
        return roadmaps[1] if len(roadmaps) > 1 else roadmaps[0]
    except Exception:
        return roadmaps[0]


def update_bandit_feedback(variant_id, rating, user_context):
    print(f"Feedback received: Variant {variant_id}, Rating {rating}")
