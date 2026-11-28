@echo off
title VLE360 Local Server
cd /d "%~dp0"
where node >nul 2>nul
if errorlevel 1 (
  echo.
  echo  Node.js is not installed.
  echo  Download the LTS version from https://nodejs.org , install it, then run this file again.
  echo.
  pause
  exit /b 1
)
echo.
echo  Starting VLE360... your browser will open in a moment.
echo  Keep this window open while you use VLE360. Close it to stop.
echo.
start "" http://localhost:4150
node backend\server.js
pause
