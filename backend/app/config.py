"""
Application configuration. All settings loaded from environment.
"""
import os
from pathlib import Path
from dotenv import load_dotenv

load_dotenv()

# Paths (backend root)
BASE_DIR = Path(__file__).resolve().parent.parent
ML_MODELS_DIR = BASE_DIR / "ml_models"
UPLOADS_DIR = BASE_DIR / "uploads"
CHROMA_DIR = BASE_DIR / "chroma_db"

# Database
DATABASE_URL = os.getenv("DATABASE_URL", "sqlite:///./pathfinder.db")

# Auth
SECRET_KEY = os.getenv("SECRET_KEY", "your-secret-key-change-in-production")
ALGORITHM = "HS256"
ACCESS_TOKEN_EXPIRE_MINUTES = 60 * 24 * 7  # 7 days

# LLM (Gemini)
GEMINI_API_KEY = os.getenv("GEMINI_API_KEY", "")

# RL
RL_MODEL_PATH = str(BASE_DIR / "rl_model.pkl")
