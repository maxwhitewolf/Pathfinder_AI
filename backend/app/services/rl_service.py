"""
Backward compatibility: re-export RL service.
Prefer: from app.services.rl import rl_service
"""
from app.services.rl import rl_service, RLService

__all__ = ["rl_service", "RLService"]
