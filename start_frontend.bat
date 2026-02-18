@echo off
echo ========================================
echo Starting PathFinder AI Frontend Server
echo ========================================
echo.

cd frontend

echo Checking Node.js installation...
node --version
if errorlevel 1 (
    echo ERROR: Node.js is not installed or not in PATH
    pause
    exit /b 1
)

echo.
echo Installing dependencies (if needed)...
if not exist node_modules (
    echo Installing npm packages...
    call npm install
)

echo.
echo Starting React development server on http://localhost:3000
echo Press Ctrl+C to stop the server
echo.

npm start

pause

