import os
import json
import google.generativeai as genai
import PyPDF2
from dotenv import load_dotenv

load_dotenv()

# Get API key from environment variable or use fallback
# IMPORTANT: Replace with your own API key from https://aistudio.google.com/apikey
GEMINI_API_KEY = os.getenv("GEMINI_API_KEY", "AIzaSyBxHM9cp_YfyVcNTRHJptvxx7vtkMQxLdc")

if GEMINI_API_KEY:
    try:
        genai.configure(api_key=GEMINI_API_KEY)
        client = genai.GenerativeModel("gemini-2.5-flash")
        print("Gemini API initialized successfully")
    except Exception as e:
        print(f"Warning: Failed to initialize Gemini API: {e}")
        client = None
else:
    client = None
MODEL = "gemini-2.5-flash"


def extract_text_from_file(file_path):
    """Extract text from PDF or DOC file"""
    try:
        if file_path.endswith('.pdf'):
            with open(file_path, 'rb') as f:
                pdf_reader = PyPDF2.PdfReader(f)
                text = ""
                for page in pdf_reader.pages:
                    text += page.extract_text()
                return text
        else:
            # For .doc/.docx, return empty (add python-docx if needed)
            return ""
    except Exception as e:
        print(f"Error extracting text: {e}")
        return ""


def extract_skills(resume_text):
    """Extract skills from resume using Gemini"""
    if not client:
        print("Warning: Gemini client not initialized")
        return {"technical_skills": [], "soft_skills": [], "error": "Gemini API not configured"}
    
    if not resume_text or len(resume_text.strip()) < 10:
        print("Warning: Resume text is too short or empty")
        return {"technical_skills": [], "soft_skills": [], "error": "Resume text is too short"}
    
    prompt = f"""You are an expert Technical Recruiter and AI Resume Parser. 
Your goal is to extract a **concise, high-value, and rich** list of skills from the provided resume.

### Instructions:
1. **Focus on HIGH-VALUE Skills:** Do not list every single noun. Extract only significant technical skills, frameworks, tools, and impactful soft skills that determine employability.
2. **Standardize Terminology:** Map variations to standard industry terms (e.g., "React.js" -> "React", "Amazon Web Services" -> "AWS", "ML" -> "Machine Learning").
3. **Remove Noise:** STRONGLY ignore generic or low-value terms (e.g., "Hardworking", "Punctual", "Microsoft Word", "Internet", "Email", "Windows", "Browsing").
4. **Categorization:**
   - **technical_skills**: Programming languages, frameworks, databases, cloud platforms, specialized tools (e.g., Docker, Kubernetes, TensorFlow).
   - **soft_skills**: **Only** include high-impact professional attributes (e.g., "Strategic Planning", "Team Leadership", "Agile Methodology", "Cross-functional Communication").

### RESUME CONTENT:
{resume_text[:5000]}

### OUTPUT FORMAT (JSON Only):
{{
  "technical_skills": ["Skill 1", "Skill 2", ...],
  "soft_skills": ["Skill 1", "Skill 2", ...]
}}

Return ONLY the valid JSON object. Do not include any markdown formatting.
"""

    try:
        response = client.generate_content(
            prompt,
            generation_config=genai.types.GenerationConfig(temperature=0.1)
        )
        
        if not response or not response.text:
            print("Warning: Empty response from Gemini")
            return {"technical_skills": [], "soft_skills": [], "error": "Empty response from AI"}
        
        response_text = response.text.strip()
        response_text = response_text.replace("```json", "").replace("```", "").strip()
        
        # Try to find JSON in the response
        import re
        json_match = re.search(r'\{[^{}]*"technical_skills"[^{}]*\}', response_text, re.DOTALL)
        if json_match:
            response_text = json_match.group(0)
        
        skills_data = json.loads(response_text)
        
        # Ensure we have the expected structure
        if not isinstance(skills_data, dict):
            return {"technical_skills": [], "soft_skills": [], "error": "Invalid response format"}
        
        # Ensure arrays exist
        technical = skills_data.get("technical_skills", [])
        soft = skills_data.get("soft_skills", [])
        
        if not isinstance(technical, list):
            technical = []
        if not isinstance(soft, list):
            soft = []
        
        print(f"Successfully extracted {len(technical)} technical skills and {len(soft)} soft skills")
        return {
            "technical_skills": technical,
            "soft_skills": soft
        }
    except json.JSONDecodeError as e:
        print(f"JSON decode error in skill extraction: {e}")
        print(f"Response text: {response_text[:200] if 'response_text' in locals() else 'N/A'}")
        return {"technical_skills": [], "soft_skills": [], "error": f"Failed to parse AI response: {str(e)}"}
    except Exception as e:
        error_msg = str(e)
        print(f"Error in skill extraction: {error_msg}")
        
        # Check for specific API errors
        if "API key" in error_msg or "PermissionDenied" in error_msg or "403" in error_msg:
            return {
                "technical_skills": [], 
                "soft_skills": [], 
                "error": "Gemini API key is invalid or expired. Please update the API key."
            }
        elif "404" in error_msg or "NotFound" in error_msg:
            return {
                "technical_skills": [], 
                "soft_skills": [], 
                "error": "Gemini model not found. Please check the model name."
            }
        else:
            return {
                "technical_skills": [], 
                "soft_skills": [], 
                "error": f"AI skill extraction failed: {error_msg}"
            }


def analyze_skill_gap(user_skills, required_skills):
    """Analyze skill gap using Gemini"""
    if not client:
        return {"transferable_skills": [], "missing_skills": [], "learning_path_summary": "", "error": "Gemini API not configured. Please set GEMINI_API_KEY."}
    
    prompt = f"""Analyze the skill gap for career transition.

CURRENT SKILLS: {', '.join(user_skills) if user_skills else 'None'}
REQUIRED SKILLS: {', '.join(required_skills)}

Return as JSON:
{{
  "transferable_skills": ["skill1", "skill2"],
  "missing_skills": [
    {{"skill": "...", "priority": "high/medium/low", "learning_time_weeks": 8, "difficulty": "...", "reason": "..."}},
    ...
  ],
  "learning_path_summary": "Brief 2-3 sentence summary"
}}

Return ONLY valid JSON."""

    try:
        response = client.generate_content(
            prompt,
            generation_config=genai.types.GenerationConfig(temperature=0.3)
        )
        
        if not response or not response.text:
            return {"transferable_skills": [], "missing_skills": [], "learning_path_summary": "", "error": "Empty response from AI"}
        
        response_text = response.text.strip()
        response_text = response_text.replace("```json", "").replace("```", "").strip()
        result = json.loads(response_text)
        result["error"] = None
        return result
    except json.JSONDecodeError as e:
        print(f"JSON decode error in skill gap analysis: {e}")
        return {"transferable_skills": [], "missing_skills": [], "learning_path_summary": "", "error": f"Failed to parse AI response: {str(e)}"}
    except Exception as e:
        error_msg = str(e)
        print(f"Error in skill gap analysis: {error_msg}")
        
        # Check for specific API errors
        if "API key" in error_msg or "PermissionDenied" in error_msg or "403" in error_msg:
            return {"transferable_skills": [], "missing_skills": [], "learning_path_summary": "", "error": "Gemini API key is invalid or expired. Please update the API key."}
        elif "404" in error_msg or "NotFound" in error_msg:
            return {"transferable_skills": [], "missing_skills": [], "learning_path_summary": "", "error": "Gemini model not found. Please check the model name."}
        else:
            return {"transferable_skills": [], "missing_skills": [], "learning_path_summary": "", "error": f"AI analysis failed: {error_msg}"}


def analyze_strengths_weaknesses(profile_data):
    """Analyze strengths and weaknesses based on profile"""
    if not client:
        return {"strengths": [], "weaknesses": [], "recommendations": [], "summary": "", "error": "Gemini API not configured. Please set GEMINI_API_KEY."}
    
    # Build academic info
    academic_info = f"Degree: {profile_data.get('degree', 'N/A')}"
    if profile_data.get('course'):
        academic_info += f", Course: {profile_data.get('course')}"
    if profile_data.get('cgpa_10th'):
        academic_info += f", 10th CGPA: {profile_data.get('cgpa_10th')}"
    if profile_data.get('cgpa_12th'):
        academic_info += f", 12th CGPA: {profile_data.get('cgpa_12th')}"
    if profile_data.get('total_cgpa'):
        academic_info += f", Total CGPA: {profile_data.get('total_cgpa')}"
    
    # Add semester CGPA
    semester_cgpas = []
    for sem in range(1, 9):
        cgpa_value = profile_data.get(f'cgpa_sem{sem}')
        if cgpa_value:
            semester_cgpas.append(f"Sem {sem}: {cgpa_value}")
    if semester_cgpas:
        academic_info += f", Semester CGPA: {', '.join(semester_cgpas)}"
    
    prompt = f"""Analyze this student's academic profile and provide insights.

Academic Information: {academic_info}
Skills: {', '.join(profile_data.get('skills', []))}
Certifications: {', '.join(profile_data.get('certifications', []))}
Achievements: {', '.join(profile_data.get('achievements', []))}

Identify:
1. Key strengths (academic + skills)
2. Areas for improvement
3. Actionable recommendations

Return as JSON:
{{
  "strengths": ["strength1", "strength2", ...],
  "weaknesses": ["weakness1", "weakness2", ...],
  "recommendations": ["recommendation1", "recommendation2", ...],
  "summary": "Brief overall assessment"
}}

Return ONLY valid JSON."""

    try:
        response = client.generate_content(
            prompt,
            generation_config=genai.types.GenerationConfig(temperature=0.5)
        )
        
        if not response or not response.text:
            return {"strengths": [], "weaknesses": [], "recommendations": [], "summary": "", "error": "Empty response from AI"}
        
        response_text = response.text.strip()
        response_text = response_text.replace("```json", "").replace("```", "").strip()
        result = json.loads(response_text)
        result["error"] = None
        return result
    except json.JSONDecodeError as e:
        print(f"JSON decode error in strengths/weaknesses analysis: {e}")
        return {"strengths": [], "weaknesses": [], "recommendations": [], "summary": "", "error": f"Failed to parse AI response: {str(e)}"}
    except Exception as e:
        error_msg = str(e)
        print(f"Error in strengths/weaknesses analysis: {error_msg}")
        
        # Check for specific API errors
        if "API key" in error_msg or "PermissionDenied" in error_msg or "403" in error_msg:
            return {"strengths": [], "weaknesses": [], "recommendations": [], "summary": "", "error": "Gemini API key is invalid or expired. Please update the API key."}
        elif "404" in error_msg or "NotFound" in error_msg:
            return {"strengths": [], "weaknesses": [], "recommendations": [], "summary": "", "error": "Gemini model not found. Please check the model name."}
        else:
            return {"strengths": [], "weaknesses": [], "recommendations": [], "summary": "", "error": f"AI analysis failed: {error_msg}"}


def chat_with_context(message, user_context):
    """Chat with career guidance"""
    if not client:
        return {"response": "Gemini API not configured. Please set GEMINI_API_KEY.", "error": "Gemini API not configured"}
    
    context_info = f"User: {user_context.get('name', 'Student')}"
    if user_context.get('target_career'):
        context_info += f", Target Career: {user_context['target_career']}"
    
    prompt = f"""{context_info}

User Question: {message}

Provide a helpful, concise response focused on career guidance. Keep it under 200 words."""

    try:
        response = client.generate_content(
            prompt,
            generation_config=genai.types.GenerationConfig(temperature=0.7)
        )
        
        if not response or not response.text:
            return {"response": "", "error": "Empty response from AI"}
        
        return {"response": response.text.strip(), "error": None}
    except Exception as e:
        error_msg = str(e)
        # Check for specific API errors
        if "API key" in error_msg or "PermissionDenied" in error_msg or "403" in error_msg:
            return {"response": "", "error": "Gemini API key is invalid or expired. Please update the API key."}
        elif "404" in error_msg or "NotFound" in error_msg:
            return {"response": "", "error": "Gemini model not found. Please check the model name."}
        else:
            return {"response": "", "error": f"AI chat failed: {error_msg}"}