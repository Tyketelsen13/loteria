# Loteria Development Server Startup Script
# Run this script to start all development servers at once

Write-Host "🎮 Starting Loteria Development Environment..." -ForegroundColor Yellow
Write-Host "=" * 50

# Kill any existing Node.js processes
Write-Host "🧹 Cleaning up existing processes..." -ForegroundColor Gray
taskkill /f /im node.exe 2>$null

Start-Sleep -Seconds 1

# Start Frontend Server (Port 3000)
Write-Host "🎨 Starting Frontend Server (Port 3000)..." -ForegroundColor Green
Start-Process powershell -ArgumentList "-NoExit", "-Command", @"
cd 'c:\Projects\loteria'
Copy-Item 'frontend-package.json' 'package.json' -Force
Write-Host '🎨 FRONTEND SERVER' -ForegroundColor Green -BackgroundColor Black
Write-Host 'URL: http://localhost:3000' -ForegroundColor White
Write-Host 'Press Ctrl+C to stop' -ForegroundColor Gray
npm run dev
"@

Start-Sleep -Seconds 2

# Start Backend Server (Port 3002)
Write-Host "⚙️ Starting Backend API Server (Port 3002)..." -ForegroundColor Blue
Start-Process powershell -ArgumentList "-NoExit", "-Command", @"
cd 'c:\Projects\loteria'
Copy-Item 'backend-package.json' 'package.json' -Force
Write-Host '⚙️ BACKEND API SERVER' -ForegroundColor Blue -BackgroundColor Black
Write-Host 'URL: http://localhost:3002' -ForegroundColor White
Write-Host 'Press Ctrl+C to stop' -ForegroundColor Gray
npm run dev
"@

Start-Sleep -Seconds 2

# Start Socket.IO Server (Port 3001)
Write-Host "🔌 Starting Socket.IO Server (Port 3001)..." -ForegroundColor Magenta
Start-Process powershell -ArgumentList "-NoExit", "-Command", @"
cd 'c:\Projects\loteria'
Write-Host '🔌 SOCKET.IO SERVER' -ForegroundColor Magenta -BackgroundColor Black
Write-Host 'URL: http://localhost:3001' -ForegroundColor White
Write-Host 'Path: /api/socket/io' -ForegroundColor Gray
Write-Host 'Press Ctrl+C to stop' -ForegroundColor Gray
node socket-server.js
"@

Write-Host ""
Write-Host "✅ All development servers started!" -ForegroundColor Green
Write-Host "🎯 Frontend:  http://localhost:3000" -ForegroundColor White
Write-Host "🔧 Backend:   http://localhost:3002" -ForegroundColor White  
Write-Host "🔌 Socket.IO: http://localhost:3001" -ForegroundColor White
Write-Host ""
Write-Host "💡 Tip: Each server is running in its own window for easy monitoring" -ForegroundColor Yellow
Write-Host "🛑 To stop all servers: Close the PowerShell windows or run 'taskkill /f /im node.exe'" -ForegroundColor Gray
