# How to Run PathFinder AI Project

## Quick Start Guide

### Prerequisites
- Python 3.11+ installed
- Node.js and npm installed
- All dependencies installed (see below)

---

## Step-by-Step Instructions

### 1. Install Backend Dependencies

```bash
cd backend
pip install -r requirements.txt
```

### 2. Install Frontend Dependencies

```bash
cd frontend
npm install
```

### 3. Start the Backend Server

**Option A: Using Python directly**
```bash
cd backend
python -m uvicorn app.main:app --host 127.0.0.1 --port 8001 --reload
```

**Option B: Using the startup script (Windows)**
```bash
.\start_backend.bat
```

**Option C: Using the startup script (Mac/Linux)**
```bash
chmod +x start_backend.sh
./start_backend.sh
```

### 4. Start the Frontend Server

**In a NEW terminal window:**
```bash
cd frontend
npm start
```

**Or use the startup script:**
```bash
.\start_frontend.bat
```

---

## Access the Application

- **Frontend (React App):** http://localhost:3000
- **Backend API:** http://localhost:8001
- **API Documentation:** http://localhost:8001/docs

---

## Troubleshooting

### Port 8001 Already in Use
If you get `ERROR: [WinError 10013]` or port already in use:

1. **Find what's using the port:**
   ```bash
   netstat -ano | findstr :8001
   ```

2. **Kill the process (replace PID with actual process ID):**
   ```bash
   taskkill /PID <PID> /F
   ```

3. **Or use a different port:**
   ```bash
   python -m uvicorn app.main:app --host 127.0.0.1 --port 8002 --reload
   ```
   Then update `frontend/src/services/api.js` to use port 8002.

### Frontend Won't Start
- Make sure Node.js is installed: `node --version`
- Delete `node_modules` and reinstall: `rm -rf node_modules && npm install`
- Check if port 3000 is available

### Backend Import Errors
- Make sure you're in the `backend` directory when running
- Install missing packages: `pip install <package-name>`
- Check Python version: `python --version` (should be 3.11+)

---

## Running Both Servers at Once

### Windows (PowerShell)
Open two terminal windows:
1. Terminal 1: `cd backend && python -m uvicorn app.main:app --host 127.0.0.1 --port 8001 --reload`
2. Terminal 2: `cd frontend && npm start`

### Using Batch Files (Windows)
1. Double-click `start_backend.bat`
2. Double-click `start_frontend.bat`

---

## Verify Everything is Working

1. **Check Backend:**
   ```bash
   curl http://localhost:8001/
   ```
   Should return: `{"message":"PathFinder AI API","status":"running"}`

2. **Check Frontend:**
   Open browser to http://localhost:3000

3. **Check API Docs:**
   Open browser to http://localhost:8001/docs

---

## Development Mode

Both servers run in **reload/watch mode**:
- Backend: Automatically restarts when you change Python files
- Frontend: Automatically refreshes when you change React files

---

## Stop the Servers

- **Backend:** Press `Ctrl+C` in the terminal
- **Frontend:** Press `Ctrl+C` in the terminal

---

## Full Command Reference

### Backend
```bash
# Navigate to backend
cd backend

# Start server (development mode with auto-reload)
python -m uvicorn app.main:app --host 127.0.0.1 --port 8001 --reload

# Start server (production mode)
python -m uvicorn app.main:app --host 0.0.0.0 --port 8001
```

### Frontend
```bash
# Navigate to frontend
cd frontend

# Start development server
npm start

# Build for production
npm run build

# Run tests
npm test
```

---

## Project Structure

```
PathfinderAI/
├── backend/
│   ├── app/              # FastAPI application
│   ├── ml_models/        # ML model files (.pkl, .model)
│   ├── ml/               # ML training notebooks
│   ├── pathfinder.db     # SQLite database
│   └── requirements.txt  # Python dependencies
│
└── frontend/
    ├── src/              # React source code
    ├── public/           # Static files
    └── package.json      # Node.js dependencies
```

---

## Need Help?

- Check the terminal output for error messages
- Verify all dependencies are installed
- Make sure ports 8001 and 3000 are not in use
- Check the API docs at http://localhost:8001/docs

