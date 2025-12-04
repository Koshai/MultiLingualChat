@echo off
title Multilingual Video Conferencing - Quick Start
color 0A
cls

echo.
echo  ================================================
echo      MULTILINGUAL VIDEO CONFERENCING
echo  ================================================
echo.
echo  This will start all services automatically.
echo.
echo  What will happen:
echo    1. Stop any running services
echo    2. Start 5 service windows
echo    3. Wait 15-20 seconds
echo    4. Open browser to http://localhost:5173
echo.
echo  ================================================
echo.
pause

REM Run the start-all script
call start-all.bat

echo.
echo  ================================================
echo      Services Starting...
echo  ================================================
echo.
echo  Waiting for services to initialize...
echo.

REM Wait for services to start (20 seconds)
ping 127.0.0.1 -n 21 > nul

echo  Opening application in browser...
start http://localhost:5173

echo.
echo  ================================================
echo      APPLICATION READY!
echo  ================================================
echo.
echo  The application should now be open in your browser.
echo.
echo  If not, manually open: http://localhost:5173
echo.
echo  To stop all services later, run: stop-all.bat
echo.
echo  ================================================
echo.
pause
