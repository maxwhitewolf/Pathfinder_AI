# Job-Specific Roadmap Generation Implementation

## Overview
A new service has been created to generate RL-aware learning roadmaps for specific job + user combinations using Google Gemini AI.

## Files Created/Modified

### 1. New Service File: `backend/app/job_roadmap_service.py`
- **Purpose**: Separate service for job-specific roadmap generation
- **Function**: `generate_job_roadmap(job: dict, user_profile: dict)`
- **Features**:
  - Uses existing Gemini client from `gemini_service.py`
  - Generates structured JSON with:
    - `role_summary`: Job role details and required tech stack
    - `gap_analysis`: Comparison between user skills and job requirements
    - `roadmap`: Phased learning path with RL status options

### 2. Updated API Endpoints

#### For Recruiters: `POST /api/jobs/{job_id}/generate-roadmap`
- Generates a template roadmap for a job posting
- Saves roadmap to `job.roadmap_json` in database
- Uses generic user profile

#### For Users: `POST /api/jobs/{job_id}/generate-roadmap-for-user`
- Generates personalized roadmap based on user's actual profile
- Uses user's skills, certifications, achievements
- Returns personalized learning path

## Roadmap Structure

The generated roadmap follows this JSON structure:

```json
{
  "role_summary": {
    "title": "Job Title",
    "what_you_do": ["responsibility 1", "responsibility 2"],
    "required_stack": {
      "frontend": ["React", "TypeScript"],
      "backend": ["Node.js", "Python"],
      "ai_ml": ["TensorFlow", "LangChain"],
      "cloud_devops": ["AWS", "Docker"],
      "data": ["SQL", "NoSQL"],
      "mlops": ["model serving", "monitoring"],
      "nice_to_have": ["LLMs", "Vector DBs"]
    }
  },
  "gap_analysis": {
    "current_skills": ["Python", "HTML"],
    "transferable_skills": ["Problem Solving"],
    "missing_skills": [
      {
        "skill": "React",
        "priority": "high",
        "reason": "Required for frontend development"
      }
    ],
    "missing_certifications": ["AWS Certified"],
    "missing_experience": ["Production deployments"],
    "summary": "User needs to learn React and cloud deployment"
  },
  "roadmap": {
    "phases": [
      {
        "phase_id": 1,
        "phase_name": "Frontend Foundations",
        "goal": "Learn React and TypeScript",
        "estimated_duration_weeks": 6,
        "tasks": [
          {
            "task_id": "task_1",
            "title": "Learn React",
            "jd_alignment": ["Strong React proficiency required"],
            "description": "Master React fundamentals",
            "status_options": ["start", "already_know", "need_easier", "skip", "finished"],
            "subtasks": ["Learn components", "Learn state management"],
            "recommended_courses": ["React Complete Guide"],
            "recommended_projects": ["Build a dashboard"],
            "skills_gained": ["React", "TypeScript"]
          }
        ]
      }
    ]
  }
}
```

## RL Status Options

Each task includes status options for reinforcement learning:
- `start`: User can begin this task
- `already_know`: User already knows this (skips or reviews)
- `need_easier`: Task is too difficult (suggests prerequisites)
- `skip`: User chooses to skip this task
- `finished`: Task completed

## Usage Examples

### For Recruiters:
```bash
POST /api/jobs/1/generate-roadmap
Headers: Authorization: Bearer <recruiter_token>
```

### For Users:
```bash
POST /api/jobs/1/generate-roadmap-for-user
Headers: Authorization: Bearer <user_token>
```

## Integration Notes

1. **Gemini Client**: Reuses existing client from `gemini_service.py`
2. **Error Handling**: Follows same patterns as other Gemini functions
3. **Database**: Roadmaps can be saved to `job.roadmap_json` field
4. **User Profile**: Automatically extracts skills from user profile
5. **Job Data**: Converts SQLAlchemy models to dict format for service

## Future Enhancements

- Store user-specific roadmaps in database
- Track user progress through roadmap phases
- Use RL feedback to adapt roadmap recommendations
- Cache roadmaps for frequently accessed jobs
- Add roadmap comparison features

