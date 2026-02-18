"""
Backward compatibility: re-export RAG service.
Prefer: from app.services.rag import rag_service
"""
from app.services.rag import rag_service, RAGService

__all__ = ["rag_service", "RAGService"]
