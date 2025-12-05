@echo off
echo ================================================
echo   Starting Pinggy Tunnel (Services Already Running)
echo ================================================
echo.

echo Checking if frontend is running on port 5173...
netstat -ano | findstr ":5173" | findstr "LISTENING" >nul
if %ERRORLEVEL% NEQ 0 (
    echo ERROR: Frontend is not running!
    echo.
    echo Please run START-HERE.bat first to start all services.
    echo.
    pause
    exit /b 1
)

echo ✓ Frontend is running!
echo.
echo Starting Pinggy tunnel...
echo.
echo ================================================
echo   Your public URL will appear below:
echo ================================================
echo.

REM Start Pinggy tunnel (assumes services already running)
ssh -p 443 -R0:localhost:5173 a.pinggy.io

pause
