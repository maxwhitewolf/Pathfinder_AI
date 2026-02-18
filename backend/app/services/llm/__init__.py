"""
LLM service: Gemini — resume parsing, skill extraction, chat, skill-gap, strengths/weaknesses.
"""
from app.services.llm.gemini import (
    extract_text_from_file,
    extract_skills,
    analyze_skill_gap,
    analyze_strengths_weaknesses,
    chat_with_context,
)

__all__ = [
    "extract_text_from_file",
    "extract_skills",
    "analyze_skill_gap",
    "analyze_strengths_weaknesses",
    "chat_with_context",
]
