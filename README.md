# PathFinder AI

## Run the project

**Backend (port 8001):**
```bash
cd backend
pip install -r requirements.txt
python -m uvicorn app.main:app --host 127.0.0.1 --port 8001 --reload
```

**Frontend (port 3000):** In a new terminal:
```bash
cd frontend
npm install
npm start
```

- App: http://localhost:3000  
- API: http://localhost:8001  
- API docs: http://localhost:8001/docs  

**Or use:** `start_all.bat` (Windows) to start both.

## Backend setup

- Copy `backend/.env.example` to `backend/.env` and set `GEMINI_API_KEY` if you use Gemini features.
- Database: SQLite at `backend/pathfinder.db` (created on first run).
- RAG vector store: `backend/chroma_db`. Seed with `python scripts/seed_rag.py` from `backend/`.
