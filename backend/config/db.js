const mongoose = require('mongoose');
const dotenv = require('dotenv');

const path = require('path');
const { exec } = require('child_process');

dotenv.config();

let inMemoryServer = null;

const fs = require('fs');

// Function to try and auto-start the local MongoDB process if it's down
const autoStartMongo = () => {
  const mongoPath = `"C:\\Users\\hp\\Program Files\\MongoDB\\mongodb-win32-x86_64-windows-8.2.2\\bin\\mongod.exe"`;
  const dbPathDir = path.join(__dirname, '..', 'data', 'db');

  // Ensure database folder exists
  if (!fs.existsSync(dbPathDir)) {
    console.log("📂 Database folder missing. Creating...");
    fs.mkdirSync(dbPathDir, { recursive: true });
  }

  const dbPath = `"${dbPathDir}"`;
  const lockFile = path.join(dbPathDir, 'mongod.lock');

  // CLEANUP: If there is a stale lock file (PC crashed), mongod won't start
  if (fs.existsSync(lockFile)) {
    console.log("🧹 Cleanup: Removing stale lock file from previous session...");
    try { fs.unlinkSync(lockFile); } catch (e) { }
  }

  console.log(`🚀 Automated Recovery: Trying to start MongoDB from ${mongoPath}...`);
  
  exec(`start "PoetVerse-DB" /min ${mongoPath} --dbpath ${dbPath} --port 27017`, (err) => {
    if (err) console.error("❌ Auto-start failed. Please run Start_Platform.bat manually.");
  });
};

/**
 * Try to connect to real MongoDB; if it fails after retries, attempt auto-start then fall back to in-memory.
 */
const connectDB = async (retries = 3, delay = 2000) => {
  const tryConnect = async (uri) => {
    return mongoose.connect(uri, { serverSelectionTimeoutMS: 5000 });
  };

  const uri = process.env.MONGO_URI;

  if (uri) {
    try {
      const conn = await tryConnect(uri);
      console.log(`✅ MongoDB Connected: ${conn.connection.host}`);
      return;
    } catch (err) {
      console.error(`❌ Error connecting to MongoDB: ${err.message}`);
      if (retries > 0) {
        // If this is the first failure, try to start the local MongoDB process automatically
        if (retries === 3) autoStartMongo();
        
        console.log(`Retrying to connect in ${delay / 1000}s... (${retries} attempts left)`);
        await new Promise((res) => setTimeout(res, delay));
        return connectDB(retries - 1, Math.min(delay * 2, 30000));
      }
      console.error('Could not connect to provided MONGO_URI. Falling back to in-memory MongoDB for development.');
    }
  } else {
    console.warn('No MONGO_URI provided; starting in-memory MongoDB for development.');
  }

  // If we reach here, start an in-memory mongo for development convenience
  try {
    const { MongoMemoryServer } = require('mongodb-memory-server');

    console.log('⏳ Starting in-memory MongoDB (first run may take a minute to download the binary)...');

    // Give it plenty of time - first run downloads ~300MB MongoDB binary
    inMemoryServer = await MongoMemoryServer.create({
      instance: {
        launchTimeout: 120000, // 120 seconds to start the instance
      },
      binary: {
        downloadDir: require('path').join(__dirname, '..', 'node_modules', '.cache', 'mongodb-binaries'),
      },
    });

    const memUri = inMemoryServer.getUri();
    const conn = await mongoose.connect(memUri);
    console.log(`🧪 Connected to in-memory MongoDB: ${conn.connection.host}`);
    console.log('Note: in-memory MongoDB is ephemeral and resets on restart. Use a real MongoDB for production.');
  } catch (memErr) {
    console.error('❌ Failed to start in-memory MongoDB:', memErr.message);
    console.error('');
    console.error('💡 To fix this, please ensure your local MongoDB is running:');
    console.error('   1. Run [Start_Platform.bat] in the root folder to start everything.');
    console.error('   2. Or run [Start_Database.bat] in the root folder to only start the database.');
    console.error('   3. Alternatively, check if MongoDB is installed at: C:/Users/hp/Program Files/MongoDB/...');
    process.exit(1);
  }
};

module.exports = connectDB;
