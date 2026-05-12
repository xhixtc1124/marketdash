@echo off
echo Starting MarketDash...

taskkill /F /IM python.exe >nul 2>&1
taskkill /F /IM node.exe >nul 2>&1
timeout /t 1 /nobreak >nul

start "Backend" cmd /k "cd /d %~dp0backend && python -m uvicorn app.main:app"
start "Frontend" cmd /k "cd /d %~dp0frontend && npm run dev"

timeout /t 5 /nobreak >nul
start http://localhost:5173
