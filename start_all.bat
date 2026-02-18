@echo off
echo ========================================
echo Starting PathFinder AI - Both Servers
echo ========================================
echo.

echo Starting Backend Server...
start "PathFinder Backend" cmd /k "cd /d %~dp0backend && python -m uvicorn app.main:app --host 127.0.0.1 --port 8001 --reload"

timeout /t 3 /nobreak >nul

echo Starting Frontend Server...
start "PathFinder Frontend" cmd /k "cd /d %~dp0frontend && npm start"

echo.
echo ========================================
echo Both servers are starting!
echo ========================================
echo.
echo Backend:  http://localhost:8001
echo Frontend: http://localhost:3000
echo API Docs: http://localhost:8001/docs
echo.
echo Close the terminal windows to stop the servers.
echo.
pause

