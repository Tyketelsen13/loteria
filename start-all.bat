@echo off
echo Starting all servers...

echo Starting Socket Server...
start "Socket Server" cmd /k "cd /d %~dp0 && node socket-server.js"

echo Waiting 2 seconds...
timeout /t 2 /nobreak > nul

echo Starting Frontend...
start "Frontend" cmd /k "cd /d %~dp0 && npm run dev"

echo Waiting 2 seconds...
timeout /t 2 /nobreak > nul

echo Starting Backend...
start "Backend" cmd /k "cd /d %~dp0 && npm run backend"

echo All servers started!
pause
