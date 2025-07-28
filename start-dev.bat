@echo off
echo 🎮 Starting Loteria Development Environment...
echo ==================================================

echo 🧹 Cleaning up existing processes...
taskkill /f /im node.exe >nul 2>&1

timeout /t 1 >nul

echo 🎨 Starting Frontend Server (Port 3000)...
start "Frontend Server" powershell -Command "cd 'c:\Projects\loteria'; Copy-Item 'frontend-package.json' 'package.json' -Force; Write-Host '🎨 FRONTEND SERVER' -ForegroundColor Green; Write-Host 'URL: http://localhost:3000' -ForegroundColor White; npm run dev"

timeout /t 2 >nul

echo ⚙️ Starting Backend API Server (Port 3002)...
start "Backend Server" powershell -Command "cd 'c:\Projects\loteria'; Copy-Item 'backend-package.json' 'package.json' -Force; Write-Host '⚙️ BACKEND API SERVER' -ForegroundColor Blue; Write-Host 'URL: http://localhost:3002' -ForegroundColor White; npm run dev"

timeout /t 2 >nul

echo 🔌 Starting Socket.IO Server (Port 3001)...
start "Socket Server" powershell -Command "cd 'c:\Projects\loteria'; Write-Host '🔌 SOCKET.IO SERVER' -ForegroundColor Magenta; Write-Host 'URL: http://localhost:3001' -ForegroundColor White; node socket-server.js"

echo.
echo ✅ All development servers started!
echo 🎯 Frontend:  http://localhost:3000
echo 🔧 Backend:   http://localhost:3002
echo 🔌 Socket.IO: http://localhost:3001
echo.
echo 💡 Tip: Each server is running in its own window
echo 🛑 To stop all: Close the windows or run 'taskkill /f /im node.exe'
pause
