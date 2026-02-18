# 🚀 Quick Start - Run PathFinder AI

## Easiest Way (Windows)

**Double-click these files:**

1. **`start_backend.bat`** - Starts the backend server
2. **`start_frontend.bat`** - Starts the frontend server

**OR**

**Double-click:**
- **`start_all.bat`** - Starts both servers at once!

---

## Manual Way

### Terminal 1 - Backend:
```bash
cd backend
python -m uvicorn app.main:app --host 127.0.0.1 --port 8001 --reload
```

### Terminal 2 - Frontend:
```bash
cd frontend
npm start
```

---

## Access URLs

- 🌐 **Frontend:** http://localhost:3000
- 🔧 **Backend API:** http://localhost:8001
- 📚 **API Docs:** http://localhost:8001/docs

---

## First Time Setup

If you haven't installed dependencies yet:

```bash
# Backend dependencies
cd backend
pip install -r requirements.txt

# Frontend dependencies
cd frontend
npm install
```

---

## Troubleshooting

**Port 8001 in use?**
- Kill the process: `taskkill /PID <PID> /F`
- Or use port 8002 and update frontend API URL

**Port 3000 in use?**
- React will ask to use a different port automatically

**Import errors?**
- Make sure you're in the correct directory
- Install missing packages: `pip install <package>`

---

## That's it! 🎉

The application should now be running!

