@echo off
echo Starting MarketDash...

taskkill /F /IM python.exe >nul 2>&1
taskkill /F /IM node.exe >nul 2>&1
timeout /t 1 /nobreak >nul

echo Checking dependencies...

if not exist "%~dp0frontend\node_modules" (
    echo Installing frontend dependencies...
    cd /d "%~dp0frontend"
    npm install
)

cd /d "%~dp0backend"
pip install -r requirements.txt --quiet

start "Backend" cmd /k "cd /d %~dp0backend && python -m uvicorn app.main:app"
start "Frontend" cmd /k "cd /d %~dp0frontend && npm run dev"

timeout /t 5 /nobreak >nul
start http://localhost:5173
