@echo off
echo Starting MarketDash...

start "Backend" cmd /k "cd /d %~dp0backend && python -m uvicorn app.main:app --reload"
start "Frontend" cmd /k "cd /d %~dp0frontend && npm run dev"

timeout /t 3 /nobreak >nul
start http://localhost:5173
