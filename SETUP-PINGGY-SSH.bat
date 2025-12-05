@echo off
echo ================================================
echo   Pinggy SSH Key Setup
echo ================================================
echo.

REM Check if SSH key exists
if exist "%USERPROFILE%\.ssh\id_rsa" (
    echo SSH key already exists!
    echo Location: %USERPROFILE%\.ssh\id_rsa
    echo.
    echo You can now use START-PINGGY.bat
    echo.
    pause
    exit /b 0
)

echo SSH key not found. Creating one now...
echo.
echo IMPORTANT: Press Enter for all prompts (3 times)
echo.
pause

REM Create .ssh directory if it doesn't exist
if not exist "%USERPROFILE%\.ssh" (
    mkdir "%USERPROFILE%\.ssh"
)

REM Generate SSH key
ssh-keygen -t rsa -b 2048 -f "%USERPROFILE%\.ssh\id_rsa" -N ""

echo.
echo ================================================
echo   SSH Key Created Successfully!
echo ================================================
echo.
echo Location: %USERPROFILE%\.ssh\id_rsa
echo.
echo You can now use START-PINGGY.bat without password prompts!
echo.
pause
