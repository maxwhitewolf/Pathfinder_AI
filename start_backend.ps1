# PowerShell script to start PathFinder AI Backend Server

Write-Host "========================================" -ForegroundColor Cyan
Write-Host "Starting PathFinder AI Backend Server" -ForegroundColor Cyan
Write-Host "========================================" -ForegroundColor Cyan
Write-Host ""

# Get script directory
$scriptDir = Split-Path -Parent $MyInvocation.MyCommand.Path
Set-Location $scriptDir

# Check if we need to go to backend directory
if (Test-Path "backend\app\main.py") {
    Set-Location "backend"
} elseif (-not (Test-Path "app\main.py")) {
    Write-Host "ERROR: Cannot find backend directory or app\main.py" -ForegroundColor Red
    pause
    exit 1
}

Write-Host "Current directory: $(Get-Location)" -ForegroundColor Yellow
Write-Host ""

# Kill any process using port 8001
Write-Host "Checking for processes on port 8001..." -ForegroundColor Yellow
$connections = Get-NetTCPConnection -LocalPort 8001 -ErrorAction SilentlyContinue
if ($connections) {
    foreach ($conn in $connections) {
        $pid = $conn.OwningProcess
        Write-Host "Killing process $pid on port 8001..." -ForegroundColor Yellow
        Stop-Process -Id $pid -Force -ErrorAction SilentlyContinue
    }
    Start-Sleep -Seconds 2
}

# Check Python
Write-Host "Checking Python installation..." -ForegroundColor Yellow
try {
    $pythonVersion = python --version 2>&1
    Write-Host "Found: $pythonVersion" -ForegroundColor Green
} catch {
    Write-Host "ERROR: Python is not installed or not in PATH" -ForegroundColor Red
    pause
    exit 1
}

Write-Host ""
Write-Host "Installing/updating dependencies..." -ForegroundColor Yellow
pip install -r requirements.txt --quiet

Write-Host ""
Write-Host "Starting FastAPI server on http://localhost:8001" -ForegroundColor Green
Write-Host "Press Ctrl+C to stop the server" -ForegroundColor Yellow
Write-Host ""

# Start the server
python -m uvicorn app.main:app --host 127.0.0.1 --port 8001 --reload

