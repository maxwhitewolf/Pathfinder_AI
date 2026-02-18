@echo off
echo ========================================
echo Starting PathFinder AI Backend Server
echo ========================================
echo.

REM Get the directory where this script is located
set SCRIPT_DIR=%~dp0
cd /d "%SCRIPT_DIR%"

REM Check if we're in the root, if so go to backend
if exist "backend\app\main.py" (
    cd backend
) else if exist "app\main.py" (
    REM Already in backend directory
) else (
    echo ERROR: Cannot find backend directory
    pause
    exit /b 1
)

echo Current directory: %CD%
echo.

REM Kill any process using port 8001
echo Checking for processes on port 8001...
for /f "tokens=5" %%a in ('netstat -ano ^| findstr :8001 ^| findstr LISTENING') do (
    echo Killing process %%a on port 8001...
    taskkill /PID %%a /F >nul 2>&1
)
timeout /t 1 /nobreak >nul

echo Checking Python installation...
python --version
if errorlevel 1 (
    echo ERROR: Python is not installed or not in PATH
    pause
    exit /b 1
)

echo.
echo Installing/updating dependencies...
pip install -r requirements.txt --quiet

echo.
echo Starting FastAPI server on http://localhost:8001
echo Press Ctrl+C to stop the server
echo.

python -m uvicorn app.main:app --host 127.0.0.1 --port 8001 --reload

pause

