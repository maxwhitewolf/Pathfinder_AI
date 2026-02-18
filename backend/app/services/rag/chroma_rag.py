"""
RAG: ChromaDB vector store, Gemini or default embeddings. Uses app.config.
"""
import os
import chromadb
import google.generativeai as genai
from chromadb.utils import embedding_functions

from app.config import GEMINI_API_KEY, CHROMA_DIR


class GeminiEmbeddingFunction(embedding_functions.EmbeddingFunction):
    def __init__(self, api_key: str):
        self.api_key = api_key
        if api_key:
            genai.configure(api_key=api_key)

    def __call__(self, input: list) -> list:
        if not self.api_key:
            return [[0.0] * 768 for _ in input]
        out = []
        for text in input:
            try:
                r = genai.embed_content(model="models/embedding-001", content=text, task_type="retrieval_document", title="Pathfinder Content")
                out.append(r["embedding"])
            except Exception as e:
                print(f"Embedding error: {e}")
                out.append([0.0] * 768)
        return out


class RAGService:
    def __init__(self, persist_path=None):
        path = persist_path or str(CHROMA_DIR)
        self.client = chromadb.PersistentClient(path=path)
        if GEMINI_API_KEY:
            self.embed_fn = GeminiEmbeddingFunction(GEMINI_API_KEY)
        else:
            self.embed_fn = embedding_functions.DefaultEmbeddingFunction()
        self.collection = self.client.get_or_create_collection(
            name="pathfinder_context", embedding_function=self.embed_fn
        )

    def index_content(self, doc_id: str, text: str, metadata: dict = None):
        self.collection.add(documents=[text], metadatas=[metadata or {}], ids=[doc_id])

    def retrieve_context(self, query: str, n_results: int = 3):
        return self.collection.query(query_texts=[query], n_results=n_results)

    def clear_collection(self):
        self.client.delete_collection("pathfinder_context")
        self.collection = self.client.get_or_create_collection(
            name="pathfinder_context", embedding_function=self.embed_fn
        )


rag_service = RAGService()
