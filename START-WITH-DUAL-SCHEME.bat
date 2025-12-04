@echo off
title Ngrok with Both HTTP and HTTPS
color 0A
cls

echo ================================================
echo   STARTING NGROK WITH DUAL SCHEMES
echo ================================================
echo.

REM Kill existing ngrok only
echo Stopping any existing ngrok...
taskkill /F /IM ngrok.exe >nul 2>&1
echo Done.
echo.

echo Starting ngrok with BOTH HTTP and HTTPS...
echo Command: ngrok http --scheme http --scheme https 8080
echo.

start "Ngrok (HTTP + HTTPS)" cmd /k "ngrok http --scheme http --scheme https 8080"

echo.
echo ================================================
echo   NGROK IS STARTING
echo ================================================
echo.
echo Look at the "Ngrok (HTTP + HTTPS)" window.
echo.
echo You should see TWO forwarding URLs:
echo.
echo   Forwarding  http://xxx.ngrok-free.app -^> http://localhost:8080
echo   Forwarding  https://xxx.ngrok-free.app -^> http://localhost:8080
echo.
echo ================================================
echo   IMPORTANT: USE THE HTTP URL
echo ================================================
echo.
echo Copy the HTTP URL (starts with http://)
echo Open it in your browser
echo.
echo The HTTP URL should work WITHOUT SSL errors!
echo.
echo ================================================
echo.
pause

echo Opening ngrok dashboard...
start http://127.0.0.1:4040
echo.
echo Check the dashboard for incoming requests!
echo.
