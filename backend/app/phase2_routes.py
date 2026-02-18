from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from app.database import get_db
from app import schemas, auth, models
from app.services.rl_service import rl_service
from app.services.rag_service import rag_service

router = APIRouter(prefix="/api/phase2", tags=["phase2"])

@router.post("/interactions/log")
def log_interaction(
    request: schemas.InteractionLogRequest,
    current_user: models.User = Depends(auth.get_current_user),
    db: Session = Depends(get_db)
):
    """
    Log user interaction with roadmap tasks.
    Triggers RL policy update if a reward signal is present.
    """
    # 1. Save raw interaction
    interaction = models.JobInteraction(
        user_id=current_user.id,
        job_id=request.job_id,
        roadmap_id=request.roadmap_id,
        task_id=request.task_id,
        action_type=request.action_type,
        difficulty_rating=request.difficulty_rating,
        duration_seconds=request.duration_seconds
    )
    db.add(interaction)
    db.commit()
    
    # 2. Update RL policy if applicable
    reward = 0.0
    if request.action_type == "complete":
        reward = 1.0
    elif request.action_type == "skip":
        reward = -0.5
    elif request.difficulty_rating:
        # 1 (Too Hard) -> -1.0
        # 3 (Just Right) -> 0.1
        # 5 (Too Easy/Good) -> 0.5
        mapping = {1: -1.0, 2: -0.5, 3: 0.1, 4: 0.5, 5: 1.0}
        reward = mapping.get(request.difficulty_rating, 0.0)
    
    if reward != 0.0:
        # We associate the reward with the last recommended action or default RECOMMEND_NEXT
        # For simplicity in this iteration, we update the RECOMMEND_NEXT arm
        rl_service.update_policy(current_user.id, "RECOMMEND_NEXT", reward, db)

    return {"status": "success", "reward_calculated": reward}

@router.get("/recommend", response_model=schemas.RecommendationResponse)
def get_recommendation(
    current_user: models.User = Depends(auth.get_current_user),
    db: Session = Depends(get_db)
):
    """
    Get the next best action/task recommendation from the RL model.
    """
    rec = rl_service.get_recommendation(current_user.id, db)
    return rec

@router.post("/rag/query")
def query_rag_context(
    query: str,
    top_k: int = 3,
    current_user: models.User = Depends(auth.get_current_user)
):
    """
    Retrieve relevant context using RAG (ChromaDB + Gemini).
    """
    results = rag_service.retrieve_context(query, n_results=top_k)
    return {"results": results}
