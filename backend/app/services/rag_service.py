import os
import chromadb
import google.generativeai as genai
from chromadb.utils import embedding_functions
from dotenv import load_dotenv

load_dotenv()

GEMINI_API_KEY = os.getenv("GEMINI_API_KEY")

class GeminiEmbeddingFunction(embedding_functions.EmbeddingFunction):
    def __init__(self, api_key):
        self.api_key = api_key
        if api_key:
            genai.configure(api_key=api_key)

    def __call__(self, input: list[str]) -> list[list[float]]:
        if not self.api_key:
            # Fallback or error
            return [[0.0]*768 for _ in input]
        
        embeddings = []
        for text in input:
            try:
                result = genai.embed_content(
                    model="models/embedding-001",
                    content=text,
                    task_type="retrieval_document",
                    title="Pathfinder Content"
                )
                embeddings.append(result['embedding'])
            except Exception as e:
                print(f"Embedding error: {e}")
                embeddings.append([0.0]*768) # Placeholder on error
        return embeddings

class RAGService:
    def __init__(self, persist_path="./chroma_db"):
        self.client = chromadb.PersistentClient(path=persist_path)
        
        # Use Gemini embeddings if key available, else default (SentenceTransformer)
        if GEMINI_API_KEY:
            self.embed_fn = GeminiEmbeddingFunction(GEMINI_API_KEY)
        else:
            # Fallback to default (all-MiniLM-L6-v2)
            self.embed_fn = embedding_functions.DefaultEmbeddingFunction()

        self.collection = self.client.get_or_create_collection(
            name="pathfinder_context",
            embedding_function=self.embed_fn
        )

    def index_content(self, doc_id: str, text: str, metadata: dict = None):
        """
        Add a document to the vector store.
        """
        if not metadata:
            metadata = {}
        
        self.collection.add(
            documents=[text],
            metadatas=[metadata],
            ids=[doc_id]
        )

    def retrieve_context(self, query: str, n_results: int = 3):
        """
        Retrieve relevant context for a query.
        """
        results = self.collection.query(
            query_texts=[query],
            n_results=n_results
        )
        return results

    def clear_collection(self):
        self.client.delete_collection("pathfinder_context")
        self.collection = self.client.get_or_create_collection(
            name="pathfinder_context",
            embedding_function=self.embed_fn
        )

rag_service = RAGService()
