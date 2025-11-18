@echo off
echo Starting frontend services...

REM Check Node.js
node --version >nul 2>&1
if %errorlevel% neq 0 (
    echo Error: Node.js not installed or not in PATH
    echo Please install Node.js first: https://nodejs.org/
    pause
    exit /b 1
)

REM Check npm
npm --version >nul 2>&1
if %errorlevel% neq 0 (
    echo Error: npm not installed or not in PATH
    pause
    exit /b 1
)

echo Node.js and npm check passed

REM Start frontend (port 8082)
if exist "springboot1ngh61a2\src\main\resources\front\front" (
    echo Starting frontend service...
    start "Frontend Service (Port 8082)" cmd /k "cd springboot1ngh61a2\src\main\resources\front\front && npm run dev -- --port 8082"
    echo Frontend service started (Port 8082)
) else (
    echo Error: Frontend directory not found
)

REM Start admin (port 8081)
if exist "springboot1ngh61a2\src\main\resources\admin\admin" (
    echo Starting admin service...
    start "Admin Service (Port 8081)" cmd /k "cd springboot1ngh61a2\src\main\resources\admin\admin && npm run dev -- --port 8081"
    echo Admin service started (Port 8081)
) else (
    echo Error: Admin directory not found
)

echo.
echo All frontend services started!
echo Frontend URL: http://localhost:8082
echo Admin URL: http://localhost:8081
echo Press any key to close this window, services will continue running in their own windows...
pause >nul