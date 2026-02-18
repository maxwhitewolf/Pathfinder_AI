import numpy as np
import random
import json
from datetime import datetime
from sqlalchemy.orm import Session
from app.models import JobInteraction, RewardLog, UserProfile, Roadmap

class RLService:
    def __init__(self, epsilon=0.2):
        self.epsilon = epsilon
        self.actions = ["RECOMMEND_NEXT", "INSERT_PREREQUISITE", "SKIP_AHEAD"]
        self.model_path = "rl_model.pkl"
        self.load_model()

    def load_model(self):
        """Load model weights from disk"""
        try:
            import pickle
            import os
            if os.path.exists(self.model_path):
                with open(self.model_path, 'rb') as f:
                    self.theta = pickle.load(f)
                print(f"RL Model loaded from {self.model_path}")
            else:
                print("No existing RL model found. Initializing new weights.")
                self.theta = np.random.rand(len(self.actions), 5) # 5 state features
        except Exception as e:
            print(f"Error loading RL model: {e}")
            self.theta = np.random.rand(len(self.actions), 5)

    def save_model(self):
        """Save model weights to disk"""
        try:
            import pickle
            with open(self.model_path, 'wb') as f:
                pickle.dump(self.theta, f)
            print(f"RL Model saved to {self.model_path}")
        except Exception as e:
            print(f"Error saving RL model: {e}")

    def get_state(self, user_id: int, db: Session) -> np.ndarray:
        """
        Constructs the state vector for a user.
        State Features (simplified):
        1. Avg Difficulty Rating (normalized 0-1)
        2. Task Completion Rate (normalized)
        3. Current Phase Index (normalized)
        4. Time per task (normalized)
        5. Bias / Intercept
        """
        if db is None:
            return np.array([0.5, 0.0, 0.0, 0.5, 1.0]) # Default cold start state

        # Fetch recent interactions
        interactions = db.query(JobInteraction).filter_by(user_id=user_id).all()
        
        if not interactions:
            return np.array([0.5, 0.0, 0.0, 0.5, 1.0]) # Default cold start state

        # Calculate metrics
        difficulties = [i.difficulty_rating for i in interactions if i.difficulty_rating]
        avg_difficulty = (sum(difficulties) / len(difficulties)) / 5.0 if difficulties else 0.5
        
        completions = [1 for i in interactions if i.action_type == "complete"]
        completion_rate = len(completions) / len(interactions) if interactions else 0.0

        # Placeholder for phase index (requires parsing roadmap_data)
        current_phase = 0.1 
        
        # Placeholder for time per task
        avg_time = 0.5 

        return np.array([avg_difficulty, completion_rate, current_phase, avg_time, 1.0])

    def get_recommendation(self, user_id: int, db: Session, context_task_id: str = None):
        """
        Returns the best action using Epsilon-Greedy Contextual Bandit.
        """
        state = self.get_state(user_id, db)

        # Explore
        if random.random() < self.epsilon:
            action = random.choice(self.actions)
            explanation = "Exploration (trying new strategy)"
        else:
            # Exploit: Select action with highest expected reward (dot product)
            # theta shape: (n_actions, n_features), state: (n_features,)
            # expected_rewards: (n_actions,)
            expected_rewards = np.dot(self.theta, state)
            best_action_idx = np.argmax(expected_rewards)
            action = self.actions[best_action_idx]
            explanation = f"Model Prediction (Score: {expected_rewards[best_action_idx]:.2f})"

        return {
            "action": action,
            "explanation": explanation,
            "context_task_id": context_task_id
        }

    def update_policy(self, user_id: int, action: str, reward: float, db: Session):
        """
        Updates the model weights based on the received reward.
        Uses a simple SGD update rule for the linear bandit.
        """
        state = self.get_state(user_id, db)
        action_idx = self.actions.index(action)
        
        # Prediction
        prediction = np.dot(self.theta[action_idx], state)
        
        # Error
        error = reward - prediction
        
        # Update weights (Learning Rate alpha = 0.1)
        alpha = 0.1
        self.theta[action_idx] += alpha * error * state

        # Log reward
        new_log = RewardLog(
            user_id=user_id,
            reward_value=reward,
            model_version="v1_linear_sgd",
            timestamp=datetime.utcnow()
        )
        db.add(new_log)
        db.commit()
        
        # Save model state
        self.save_model()

# Singleton instance
rl_service = RLService()
