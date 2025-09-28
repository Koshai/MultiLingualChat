@echo off
echo 🧪 Testing Service Fixes
echo.

echo 📦 Installing chat service dependencies...
cd /d "%~dp0..\backend\services\chat-service"
call npm install
if %errorlevel% neq 0 (
    echo ❌ Failed to install chat service dependencies
    pause
    exit /b 1
)

echo 🔧 Building chat service...
call npm run build
if %errorlevel% neq 0 (
    echo ❌ Failed to build chat service
    pause
    exit /b 1
)

echo 📦 Installing frontend dependencies...
cd /d "%~dp0..\frontend"
call npm install
if %errorlevel% neq 0 (
    echo ❌ Failed to install frontend dependencies
    pause
    exit /b 1
)

echo 🔧 Building frontend...
call npm run build
if %errorlevel% neq 0 (
    echo ❌ Failed to build frontend
    pause
    exit /b 1
)

echo ✅ All services built successfully!
echo.
echo 💡 You can now run:
echo   Chat Service: cd backend\services\chat-service && npm run dev
echo   Translation Service: cd backend\services\translation-service && python main.py
echo   Frontend: cd frontend && npm run dev
echo.
pause