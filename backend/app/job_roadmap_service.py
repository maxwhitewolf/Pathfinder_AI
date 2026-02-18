"""
Backward compatibility: re-export roadmap service.
Prefer: from app.services.roadmap import generate_job_roadmap, regenerate_task
"""
from app.services.roadmap import generate_job_roadmap, regenerate_task

__all__ = ["generate_job_roadmap", "regenerate_task"]
