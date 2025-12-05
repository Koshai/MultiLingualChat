@echo off
echo ================================================
echo   Service Status Check
echo ================================================
echo.

echo Checking which ports are in use...
echo.

echo [Port 5173 - Frontend]
netstat -ano | findstr ":5173" | findstr "LISTENING"
if %ERRORLEVEL% EQU 0 (
    echo ✓ Frontend is RUNNING
) else (
    echo ✗ Frontend is NOT running
)
echo.

echo [Port 3001 - Chat Service]
netstat -ano | findstr ":3001" | findstr "LISTENING"
if %ERRORLEVEL% EQU 0 (
    echo ✓ Chat Service is RUNNING
) else (
    echo ✗ Chat Service is NOT running
)
echo.

echo [Port 3003 - Translation Service]
netstat -ano | findstr ":3003" | findstr "LISTENING"
if %ERRORLEVEL% EQU 0 (
    echo ✓ Translation Service is RUNNING
) else (
    echo ✗ Translation Service is NOT running
)
echo.

echo [Port 3004 - STT Service]
netstat -ano | findstr ":3004" | findstr "LISTENING"
if %ERRORLEVEL% EQU 0 (
    echo ✓ STT Service is RUNNING
) else (
    echo ✗ STT Service is NOT running
)
echo.

echo [Port 3005 - TTS Service]
netstat -ano | findstr ":3005" | findstr "LISTENING"
if %ERRORLEVEL% EQU 0 (
    echo ✓ TTS Service is RUNNING
) else (
    echo ✗ TTS Service is NOT running
)
echo.

echo ================================================
echo   Summary
echo ================================================
echo.
echo If all services show ✓, you're ready to use tunneling!
echo If any show ✗, run START-HERE.bat to start services.
echo.
echo To test locally: http://localhost:5173
echo.
pause
