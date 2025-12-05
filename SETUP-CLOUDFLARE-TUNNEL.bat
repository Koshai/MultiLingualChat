@echo off
echo ================================================
echo   Cloudflare Tunnel Setup
echo ================================================
echo.

REM Check if cloudflared is already installed
where cloudflared >nul 2>nul
if %ERRORLEVEL% EQU 0 (
    echo ✓ Cloudflare Tunnel is already installed!
    echo.
    cloudflared --version
    echo.
    echo You can now use TUNNEL-ONLY-CLOUDFLARE.bat
    echo.
    pause
    exit /b 0
)

echo Cloudflare Tunnel (cloudflared) is not installed.
echo.
echo Downloading installer...
echo.

REM Download cloudflared for Windows
powershell -Command "Invoke-WebRequest -Uri 'https://github.com/cloudflare/cloudflared/releases/latest/download/cloudflared-windows-amd64.exe' -OutFile '%TEMP%\cloudflared.exe'"

if %ERRORLEVEL% NEQ 0 (
    echo.
    echo ERROR: Failed to download cloudflared!
    echo.
    echo Please download manually from:
    echo https://github.com/cloudflare/cloudflared/releases
    echo.
    pause
    exit /b 1
)

echo.
echo Installing to C:\Program Files\cloudflared...
echo.

REM Create directory and move file
if not exist "C:\Program Files\cloudflared" (
    mkdir "C:\Program Files\cloudflared"
)

move /Y "%TEMP%\cloudflared.exe" "C:\Program Files\cloudflared\cloudflared.exe"

REM Add to PATH for current session
set PATH=%PATH%;C:\Program Files\cloudflared

echo.
echo ================================================
echo   Installation Complete!
echo ================================================
echo.
cloudflared --version
echo.
echo IMPORTANT: Adding to system PATH...
echo You may need to restart your terminal after this.
echo.

REM Add to system PATH permanently
powershell -Command "[Environment]::SetEnvironmentVariable('Path', [Environment]::GetEnvironmentVariable('Path', 'Machine') + ';C:\Program Files\cloudflared', 'Machine')"

echo.
echo ✓ Cloudflare Tunnel installed successfully!
echo.
echo You can now use TUNNEL-ONLY-CLOUDFLARE.bat
echo.
echo NOTE: If the command doesn't work, please:
echo 1. Close this window
echo 2. Open a NEW terminal window
echo 3. Run TUNNEL-ONLY-CLOUDFLARE.bat
echo.
pause
