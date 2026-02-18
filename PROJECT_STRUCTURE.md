# PathFinder AI – Project Structure

## Backend (`backend/`)

```
backend/
├── app/
│   ├── __init__.py
│   ├── main.py                 # FastAPI app, CORS, route includes
│   ├── config.py               # Settings (env): DATABASE_URL, GEMINI_API_KEY, SECRET_KEY, paths
│   ├── database.py             # Backward compat → app.db
│   ├── auth.py                 # Backward compat → app.core.auth
│   ├── models.py               # SQLAlchemy models (User, UserProfile, Recruiter, Job, Roadmap, JobInteraction, RewardLog)
│   ├── schemas.py              # Pydantic request/response schemas
│   ├── db/                     # Database layer
│   │   ├── __init__.py
│   │   └── database.py         # engine, SessionLocal, Base, get_db
│   ├── core/                   # Core (auth, security)
│   │   ├── __init__.py
│   │   └── auth.py             # JWT, password hash, get_current_user, get_current_recruiter
│   ├── services/               # Business logic: ML, LLM, RL, RAG, Roadmap
│   │   ├── __init__.py
│   │   ├── ml/                 # Career ML
│   │   │   ├── __init__.py
│   │   │   └── career_ml.py    # recommend_careers_knn, match_jobs_from_database, match_jobs_doc2vec, select_best_roadmap
│   │   ├── llm/                # LLM (Gemini)
│   │   │   ├── __init__.py
│   │   │   └── gemini.py       # extract_text_from_file, extract_skills, analyze_skill_gap, analyze_strengths_weaknesses, chat_with_context
│   │   ├── rl/                 # Reinforcement Learning
│   │   │   ├── __init__.py
│   │   │   └── bandit.py       # RLService, rl_service (contextual bandit for roadmap recommendations)
│   │   ├── rag/                # RAG (Retrieval-Augmented Generation)
│   │   │   ├── __init__.py
│   │   │   └── chroma_rag.py  # RAGService, rag_service (ChromaDB + Gemini embeddings)
│   │   ├── roadmap/            # Job roadmap generation
│   │   │   ├── __init__.py
│   │   │   └── job_roadmap.py  # generate_job_roadmap, regenerate_task (Gemini + RL)
│   │   ├── rl_service.py       # Backward compat → app.services.rl
│   │   └── rag_service.py      # Backward compat → app.services.rag
│   ├── job_routes.py           # API: /api/jobs (create, search, get, generate-roadmap, generate-roadmap-for-user)
│   ├── phase2_routes.py        # API: /api/phase2 (interactions/log, recommend, rag/query)
│   ├── ml_service.py           # Backward compat → app.services.ml
│   ├── gemini_service.py       # Backward compat → app.services.llm
│   └── job_roadmap_service.py  # Backward compat → app.services.roadmap
├── alembic/                    # DB migrations
├── ml/                         # ML notebooks (training, analysis)
├── ml_models/                  # Trained artifacts (KNN, Doc2Vec, etc.)
├── chroma_db/                  # RAG vector store (ChromaDB)
├── scripts/                    # seed_rag, seed_full_profile
├── uploads/                    # User-uploaded resumes
├── requirements.txt
├── .env.example
└── rl_model.pkl                # RL bandit weights
```

### Config (`app/config.py`)

- **DATABASE_URL** – SQLite (default) or PostgreSQL
- **SECRET_KEY**, **ALGORITHM**, **ACCESS_TOKEN_EXPIRE_MINUTES** – JWT
- **GEMINI_API_KEY** – Gemini LLM
- **BASE_DIR**, **ML_MODELS_DIR**, **UPLOADS_DIR**, **CHROMA_DIR**, **RL_MODEL_PATH**

### Database (`app/db/`)

- **engine**, **SessionLocal**, **Base**, **get_db** – single place for DB setup.

### Core (`app/core/auth.py`)

- **verify_password**, **get_password_hash**, **create_access_token**
- **get_current_user**, **get_current_recruiter**, **oauth2_scheme**

### Services (neat and clear)

| Service   | Path                    | Role |
|----------|-------------------------|------|
| **ML**   | `services/ml/career_ml.py`  | Career KNN, Doc2Vec job matching |
| **LLM**  | `services/llm/gemini.py`    | Resume parsing, skills, skill-gap, strengths/weaknesses, chat |
| **RL**   | `services/rl/bandit.py`     | Contextual bandit for roadmap recommendations |
| **RAG**  | `services/rag/chroma_rag.py`| ChromaDB + embeddings for retrieval-augmented context |
| **Roadmap** | `services/roadmap/job_roadmap.py` | Generate/regenerate job roadmaps (Gemini + RL) |

---

## Frontend (`frontend/`)

```
frontend/
├── public/
├── src/
│   ├── App.tsx
│   ├── index.tsx
│   ├── components/        # Reusable UI
│   │   ├── Common/        # Navbar, ChatWidget, LoadingSpinner, ProtectedRoute
│   │   └── User/          # JobComparison
│   ├── contexts/          # AuthContext
│   ├── pages/             # Route-level pages
│   │   ├── Auth/          # Login, Register
│   │   ├── Recruiter/     # Dashboard, CreateJob, CreateJobEnhanced, ManageJobs
│   │   ├── User/          # Dashboard, Profile, Jobs, JobBoard, JobDetail, JobMatching, Roadmaps, RoadmapDetail, Chat, Analysis, CareerRecommendations, ResumeUpload
│   │   └── LandingPage.js
│   ├── services/          # API client
│   │   └── api.js         # axios base, authAPI, userAPI, jobAPI, aiAPI, roadmapAPI, phase2API
│   └── utils/              # dataValidator, errorHandler
├── package.json
└── tsconfig.json
```

---

## Run

- **Backend:** `cd backend && pip install -r requirements.txt && python -m uvicorn app.main:app --host 127.0.0.1 --port 8001 --reload`
- **Frontend:** `cd frontend && npm install && npm start`
- **App:** http://localhost:3000 · **API:** http://localhost:8001 · **Docs:** http://localhost:8001/docs
