# Start backend
Start-Process powershell -ArgumentList "-NoExit", "-Command", `
  "cd '$PSScriptRoot\backend'; python -m uvicorn app.main:app --reload"

# Start frontend
Start-Process powershell -ArgumentList "-NoExit", "-Command", `
  "cd '$PSScriptRoot\frontend'; npm run dev"

Write-Host "Backend: http://localhost:8000"
Write-Host "Frontend: http://localhost:5173"
