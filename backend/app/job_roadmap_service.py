"""
Job-Specific Roadmap Generation Service
Generates RL-aware learning roadmaps for specific job + user combinations
"""
import json
import google.generativeai as genai
import os
import os
from dotenv import load_dotenv
from app.services.rl_service import rl_service # Integrated RL Service

load_dotenv()

# Get API key from environment variable
GEMINI_API_KEY = os.getenv("GEMINI_API_KEY", "AIzaSyBxHM9cp_YfyVcNTRHJptvxx7vtkMQxLdc")

# Initialize Gemini client (reusing same pattern as gemini_service)
if GEMINI_API_KEY:
    try:
        genai.configure(api_key=GEMINI_API_KEY)
        client = genai.GenerativeModel("gemini-2.5-flash")
        print("Job Roadmap Service: Gemini API initialized successfully")
    except Exception as e:
        print(f"Warning: Failed to initialize Gemini API in job_roadmap_service: {e}")
        client = None
else:
    client = None
MODEL = "gemini-2.5-flash"


def generate_job_roadmap(job: dict, user_profile: dict):
    """
    Generate an RL-ready roadmap for a specific job and user.
    
    Args:
        job: dict with fields like:
            {
                "id": "...",
                "job_title": "...",
                "company_name": "...",
                "jd_text": "...",
                "location_city": "...",
                "location_country": "...",
                "work_type": "onsite/remote/hybrid",
                "job_type": "full_time/part_time/internship/contract/freelance",
                "experience_level": "fresher/junior/mid/senior/lead",
                "min_experience_years": 0,
                "max_experience_years": 2,
                "skills_required": ["React", "Node.js", "AWS"],
                "nice_to_have_skills": ["LLMs", "LangChain"],
                "industry": "Software",
                ...
            }
        user_profile: dict with fields like:
            {
                "name": "User Name",
                "degree": "B.Tech CSE",
                "cgpa_10th": "9.4",
                "cgpa_12th": "9.1",
                "experience_years": 0,
                "current_role": "Student",
                "technical_skills": ["Python", "HTML", "CSS", "Basic React"],
                "soft_skills": ["Communication", "Problem Solving"],
                "certifications": ["Python Basics"],
                "achievements": ["Hackathon participation"],
                "target_career": "AI-Integrated Full Stack Engineer"
            }
    
    Returns:
        {
            "roadmap": { ... full JSON roadmap ... },
            "error": None or "error message"
        }
    """
    if not client:
        return {"roadmap": None, "error": "Gemini API not configured. Please set GEMINI_API_KEY."}
    
    target_career = user_profile.get("target_career") or job.get("job_title") or "AI-Integrated Full Stack Engineer"
    job_title = job.get("job_title", "")
    company_name = job.get("company_name", "")
    jd_text = job.get("jd_text", "")
    skills_required = job.get("skills_required", []) or []
    nice_to_have_skills = job.get("nice_to_have_skills", []) or []
    
    user_tech_skills = user_profile.get("technical_skills", []) or []
    user_soft_skills = user_profile.get("soft_skills", []) or []
    user_certs = user_profile.get("certifications", []) or []
    user_achievements = user_profile.get("achievements", []) or []
    user_experience_years = user_profile.get("experience_years", 0)
    user_degree = user_profile.get("degree", "N/A")
    user_course = user_profile.get("course", "N/A")
    user_cgpa_10th = user_profile.get("cgpa_10th")
    user_cgpa_12th = user_profile.get("cgpa_12th")
    user_total_cgpa = user_profile.get("total_cgpa")
    semester_cgpas = user_profile.get("semester_cgpas", [])
    
    # Build academic info string
    academic_info = f"Degree: {user_degree}"
    if user_course and user_course != "N/A":
        academic_info += f", Course: {user_course}"
    if user_cgpa_10th:
        academic_info += f", 10th CGPA: {user_cgpa_10th}"
    if user_cgpa_12th:
        academic_info += f", 12th CGPA: {user_cgpa_12th}"
    if user_total_cgpa:
        academic_info += f", Total CGPA: {user_total_cgpa}"
    if semester_cgpas:
        academic_info += f", Semester CGPA: {', '.join(semester_cgpas)}"
    
    # Build the prompt with job + user context
    prompt = f"""
You are an expert AI career coach. You design adaptive learning roadmaps for users to match specific job descriptions.

JOB DETAILS:

- Job Title: {job_title}
- Company: {company_name}
- Location: {job.get("location_city", "")}, {job.get("location_country", "")}
- Work Type: {job.get("work_type", "")}
- Job Type: {job.get("job_type", "")}
- Experience Level: {job.get("experience_level", "")}
- Min Experience (years): {job.get("min_experience_years", "")}
- Max Experience (years): {job.get("max_experience_years", "")}
- Industry: {job.get("industry", "")}

REQUIRED SKILLS (from job):
- Core required skills: {", ".join(skills_required) if skills_required else "Not explicitly listed"}
- Nice to have: {", ".join(nice_to_have_skills) if nice_to_have_skills else "None"}

JOB DESCRIPTION:
{jd_text[:4000]}

USER PROFILE:

- Name: {user_profile.get("name", "Student")}
- Academic: {academic_info}
- Experience (years): {user_experience_years}
- Technical skills: {", ".join(user_tech_skills) if user_tech_skills else "None"}
- Soft skills: {", ".join(user_soft_skills) if user_soft_skills else "None"}
- Certifications: {", ".join(user_certs) if user_certs else "None"}
- Achievements: {", ".join(user_achievements) if user_achievements else "None"}

Your task:

1) Understand what this job really expects (stack + responsibilities).
2) Compare job requirements with the user's current skills.
3) Produce a structured, RL-aware learning roadmap that will help this user reach this job.

You MUST return a SINGLE JSON object with this structure:

{{
  "role_summary": {{
    "title": "{target_career}",
    "what_you_do": [
      "... list key responsibilities extracted from JD ...",
      "...",
      "..."
    ],
    "required_stack": {{
      "frontend": ["JavaScript/TypeScript", "React", "Angular", "..."],
      "backend": ["Node.js", "Express", "Python", "Django", "Flask", "Java", "Spring Boot"],
      "ai_ml": ["TensorFlow", "PyTorch", "Hugging Face", "LangChain"],
      "cloud_devops": ["AWS", "Azure", "GCP", "Docker", "Kubernetes"],
      "data": ["SQL", "NoSQL"],
      "mlops": ["model serving", "monitoring", "CI/CD for models"],
      "nice_to_have": ["LLMs", "Generative AI", "Vector DBs", "Prompt Engineering"]
    }}
  }},
  "gap_analysis": {{
    "current_skills": {user_tech_skills},
    "transferable_skills": ["... infer from user's skills ..."],
    "missing_skills": [
      {{
        "skill": "...",
        "priority": "high/medium/low",
        "reason": "Why this is important for this job compared to user's current skills."
      }}
    ],
    "missing_certifications": [
      "... suggested certificates for this user based on job stack ..."
    ],
    "missing_experience": [
      "... practical experience the user lacks (e.g., production AI integration, microservices, cloud deployments) ..."
    ],
    "summary": "2-3 sentence summary of the gap between the user and this job."
  }},
  "roadmap": {{
    "phases": [
      {{
        "phase_id": 1,
        "phase_name": "Phase Name Based on Job Requirements",
        "goal": "Match specific JD requirement",
        "estimated_duration_weeks": 6,
        "tasks": [
          {{
            "task_id": "task_1",
            "title": "Task Title",
            "jd_alignment": [
              "Specific JD requirement this addresses",
              "Another JD requirement"
            ],
            "description": "CRITICAL: You MUST write a detailed, 50-100 word paragraph here. Explain EXACTLY what to learn, key concepts, and best practices. Do NOT just write a header. This is the main content.",
            "status_options": ["start", "already_know", "need_easier", "skip", "finished"],
            "subtasks": [
              "Subtask 1",
              "Subtask 2",
              "Subtask 3"
            ],
            "recommended_courses": [
              "Course name or platform"
            ],
            "recommended_projects": [
              "Project idea"
            ],
            "skills_gained": [
              "Skill 1",
              "Skill 2"
            ]
          }}
        ]
      }}
    ]
  }}
}}

Important:
- **DETAILED CONTENT**: The `description` field for every task must be a **rich, explanatory paragraph (min 50 words)**. Do NOT just repeat the title. Explain the concept like a mentor.
- Tailor the missing_skills list and phase emphasis based on THIS SPECIFIC USER vs THIS SPECIFIC JOB.
- Use the user's current skills to avoid repeating basics they already know.
- Create 4-6 phases that progressively build toward the job requirements.
- Each phase should have 2-4 tasks.
- Focus on skills actually mentioned in the job description.
- Return ONLY the JSON object above, no extra text.
"""

    try:
        response = client.generate_content(
            prompt,
            generation_config=genai.types.GenerationConfig(temperature=0.4)
        )
        
        if not response or not response.text:
            return {"roadmap": None, "error": "Empty response from AI while generating job roadmap."}
        
        response_text = response.text.strip()
        response_text = response_text.replace("```json", "").replace("```", "").strip()
        
        # Try to extract JSON from response
        import re
        json_match = re.search(r'\{.*\}', response_text, re.DOTALL)
        if json_match:
            response_text = json_match.group(0)
        
        roadmap = json.loads(response_text)
        
        # --- RL INTEGRATION START ---
        # Get RL recommendation to adapt the roadmap (e.g. emphasize certain tasks)
        # In a full production system, this would re-order the 'roadmap' object.
        # For now, we append the recommendation metadata so the frontend can highlight it.
        try:
            rl_recommendation = rl_service.get_recommendation(
                user_id=user_profile.get("user_id", 0), # Fallback ID if not present
                db=None # We might need a DB session here, or make get_recommendation robust to None
            )
            roadmap["rl_adaptation"] = {
                "recommended_action": rl_recommendation.get("action"),
                "explanation": rl_recommendation.get("explanation"),
                "model_version": "v1_contextual_bandit"
            }
            print(f"RL Adaptation applied: {rl_recommendation.get('action')}")
        except Exception as e:
            print(f"Warning: RL integration failed (non-blocking): {e}")
            roadmap["rl_adaptation"] = {"status": "default", "reason": "RL service unavailable"}
        # --- RL INTEGRATION END ---

        return {"roadmap": roadmap, "error": None}
        
    except json.JSONDecodeError as e:
        print(f"JSON decode error in generate_job_roadmap: {e}")
        print(f"Response text (truncated): {response_text[:400] if 'response_text' in locals() else 'N/A'}")
        return {"roadmap": None, "error": f"Failed to parse AI response: {str(e)}"}
    
    except Exception as e:
        error_msg = str(e)
        print(f"Error in generate_job_roadmap: {error_msg}")
        
        if "API key" in error_msg or "PermissionDenied" in error_msg or "403" in error_msg:
            return {"roadmap": None, "error": "Gemini API key is invalid or expired. Please update the API key."}
        elif "404" in error_msg or "NotFound" in error_msg:
            return {"roadmap": None, "error": "Gemini model not found. Please check the model name."}
        else:
            return {"roadmap": None, "error": f"AI roadmap generation failed: {error_msg}"}


def regenerate_task(current_task_title: str, feedback_type: str = "skip"):
    """
    Generate a replacement task based on user feedback.
    
    Args:
        current_task_title: Title of the task being skipped/replaced
        feedback_type: 'skip', 'too_hard', 'completed' (for next steps)
        
    Returns:
        dict: A new task object
    """
    if not client:
        return {"error": "Gemini API not configured"}

    action_context = "Provide an alternative task."
    if feedback_type == "skip":
        action_context = "The user wants to skip this. Provide a different task that achieves similar learning goals but might be more engaging or relevant."
    elif feedback_type == "too_hard":
        action_context = "The user found this too hard. Provide a simpler, foundational task to build up to this concept."
    
    prompt = f"""
    You are an intelligent adaptive learning system.
    
    Original Task: "{current_task_title}"
    User Feedback: "{feedback_type}"
    Context: {action_context}
    
    Generate a NEW replacement task object JSON.
    
    Format:
    {{
      "task_id": "new_task_generated_{{random_id}}",
      "title": "New Task Title",
      "jd_alignment": ["Alignment 1"],
      "description": "Detailed 50-100 word guidance paragraph explaining the new task.",
      "status_options": ["start", "already_know", "need_easier", "skip", "finished"],
      "subtasks": ["Subtask 1", "Subtask 2"],
      "recommended_courses": ["Course 1"],
      "recommended_projects": ["Project 1"],
      "skills_gained": ["Skill 1"]
    }}
    
    Return ONLY the JSON.
    """
    
    try:
        response = client.generate_content(
            prompt,
            generation_config=genai.types.GenerationConfig(temperature=0.7)
        )
        
        if not response or not response.text:
            return {"error": "Empty response"}
            
        text = response.text.replace("```json", "").replace("```", "").strip()
        
        import re
        # Find JSON object
        match = re.search(r'\{.*\}', text, re.DOTALL)
        if match:
            text = match.group(0)
            
        return json.loads(text)
    except Exception as e:
        print(f"Error regenerating task: {e}")
        return {"error": str(e)}
