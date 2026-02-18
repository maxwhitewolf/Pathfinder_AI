"""
Backward compatibility: re-export from app.db.
Prefer: from app.db import get_db, engine, Base, SessionLocal
"""
from app.db import Base, engine, SessionLocal, get_db

__all__ = ["Base", "engine", "SessionLocal", "get_db"]
