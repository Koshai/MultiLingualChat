@echo off
echo Checking ngrok configuration...
echo.

echo [1] Ngrok version:
ngrok version
echo.

echo [2] Checking config file location:
ngrok config check
echo.

echo [3] Testing ngrok connection (will start a tunnel for 5 seconds):
echo Starting test tunnel to http://localhost:5173...
start "Ngrok Test" cmd /c "ngrok http 5173 && timeout 5"
echo.
echo Check the new window that opened for:
echo  - "Session Status: online" (means authtoken works!)
echo  - "ERR_NGROK_108" or "authentication failed" (means authtoken issue)
echo.
echo Press any key to continue and kill the test tunnel...
pause >nul

taskkill /F /IM ngrok.exe >nul 2>&1
echo.
echo Test complete!
echo.
pause
