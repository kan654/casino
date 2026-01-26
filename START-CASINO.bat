@echo off
title Casino - Starting Servers...
color 0A

echo ========================================
echo    🎰 CASINO - Starting Servers 🎰
echo ========================================
echo.

echo [1/3] Starting Backend Server...
start "Backend Server" cmd /k "cd /d g:\STAke\backend && node server.js"

timeout /t 3 /nobreak >nul

echo [2/3] Starting Frontend Server...
start "Frontend Server" cmd /k "cd /d g:\STAke\frontend && npx vite --host"

echo [3/3] Waiting for servers to start...
timeout /t 8 /nobreak

echo.
echo ✅ Servers started!
echo 🌐 Opening browser...
start http://localhost:3000

echo.
echo ========================================
echo    Casino is running! 🎉
echo ========================================
echo.
echo Backend:  http://localhost:5000
echo Frontend: http://localhost:3000
echo.
echo Press any key to exit this window...
pause >nul