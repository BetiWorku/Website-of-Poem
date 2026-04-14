@echo off
:: This script will start MongoDB as a background process and ensure it works on every restart.
:: It uses the data folder in your backend directory to keep things simple.

set MONGO_PATH="C:\Users\hp\Program Files\MongoDB\mongodb-win32-x86_64-windows-8.2.2\bin\mongod.exe"
set DB_PATH="%~dp0backend\data\db"

if not exist %DB_PATH% (
    echo [INFO] Creating Database folder at %DB_PATH%...
    mkdir %DB_PATH%
)

echo [INFO] Starting MongoDB Server...
start "" /B %MONGO_PATH% --dbpath %DB_PATH% --port 27017

echo [SUCCESS] MongoDB is running in the background.
echo [INFO] You can now run 'npm start' in your backend and frontend.
pause
