@echo off
setlocal
cd /d "%~dp0"

echo [0/3] Cleaning up old processes...
taskkill /F /IM node.exe /T 2>nul
taskkill /F /IM mongod.exe /T 2>nul
timeout /t 2 /nobreak > nul

echo [1/3] Starting MongoDB...
:: Your local MongoDB installation path
set MONGO_PATH="C:\Users\hp\Program Files\MongoDB\mongodb-win32-x86_64-windows-8.2.2\bin\mongod.exe"
set DB_PATH="%~dp0backend\data\db"

if not exist %DB_PATH% (
    echo [INFO] Creating Database folder at %DB_PATH%...
    mkdir %DB_PATH%
)

:: Start MongoDB in a separate minimized window
start "Real MongoDB Database" /min %MONGO_PATH% --dbpath %DB_PATH% --port 27017 --bind_ip 127.0.0.1

:: Give MongoDB more time to start clearly
echo [INFO] Waiting for Database to initialize...
timeout /t 5 /nobreak > nul

echo [2/3] Starting Backend Server...
cd backend
:: Start backend in its own window
start "Backend Console" cmd /k "npm start"

cd ..
echo [3/3] Starting Frontend Website...
cd frontend
:: Start frontend in its own window
start "Frontend Website" cmd /k "npm start"

echo.
echo ==============================================================
echo [SUCCESS] Everything is starting! 
echo.
echo [!] IMPORTANT: Close ALL other terminal windows before running this.
echo [!] Check the "Backend Console" for "✅ MongoDB Connected".
echo [!] Your poems (Habtamu, Betelhem, etc.) will now be visible.
echo ==============================================================
echo.
pause
