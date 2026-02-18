"""
RL (contextual bandit): roadmap task recommendations, policy update from rewards.
Uses app.config for RL_MODEL_PATH.
"""
import os
import pickle
import random
from datetime import datetime

import numpy as np
from sqlalchemy.orm import Session

from app.config import RL_MODEL_PATH
from app.models import JobInteraction, RewardLog


class RLService:
    def __init__(self, epsilon=0.2):
        self.epsilon = epsilon
        self.actions = ["RECOMMEND_NEXT", "INSERT_PREREQUISITE", "SKIP_AHEAD"]
        self.model_path = RL_MODEL_PATH
        self.load_model()

    def load_model(self):
        try:
            if os.path.exists(self.model_path):
                with open(self.model_path, "rb") as f:
                    self.theta = pickle.load(f)
                print(f"RL Model loaded from {self.model_path}")
            else:
                self.theta = np.random.rand(len(self.actions), 5)
                print("No existing RL model found. Initializing new weights.")
        except Exception as e:
            print(f"Error loading RL model: {e}")
            self.theta = np.random.rand(len(self.actions), 5)

    def save_model(self):
        try:
            with open(self.model_path, "wb") as f:
                pickle.dump(self.theta, f)
            print(f"RL Model saved to {self.model_path}")
        except Exception as e:
            print(f"Error saving RL model: {e}")

    def get_state(self, user_id: int, db: Session) -> np.ndarray:
        if db is None:
            return np.array([0.5, 0.0, 0.0, 0.5, 1.0])
        interactions = db.query(JobInteraction).filter_by(user_id=user_id).all()
        if not interactions:
            return np.array([0.5, 0.0, 0.0, 0.5, 1.0])
        difficulties = [i.difficulty_rating for i in interactions if i.difficulty_rating]
        avg_difficulty = (sum(difficulties) / len(difficulties)) / 5.0 if difficulties else 0.5
        completions = [1 for i in interactions if i.action_type == "complete"]
        completion_rate = len(completions) / len(interactions) if interactions else 0.0
        return np.array([avg_difficulty, completion_rate, 0.1, 0.5, 1.0])

    def get_recommendation(self, user_id: int, db: Session, context_task_id: str = None) -> dict:
        state = self.get_state(user_id, db)
        if random.random() < self.epsilon:
            action = random.choice(self.actions)
            explanation = "Exploration (trying new strategy)"
        else:
            expected_rewards = np.dot(self.theta, state)
            best_idx = np.argmax(expected_rewards)
            action = self.actions[best_idx]
            explanation = f"Model Prediction (Score: {expected_rewards[best_idx]:.2f})"
        return {"action": action, "explanation": explanation, "context_task_id": context_task_id}

    def update_policy(self, user_id: int, action: str, reward: float, db: Session):
        state = self.get_state(user_id, db)
        action_idx = self.actions.index(action)
        prediction = np.dot(self.theta[action_idx], state)
        error = reward - prediction
        self.theta[action_idx] += 0.1 * error * state
        db.add(RewardLog(user_id=user_id, reward_value=reward, model_version="v1_linear_sgd", timestamp=datetime.utcnow()))
        db.commit()
        self.save_model()


rl_service = RLService()
