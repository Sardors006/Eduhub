const fs = require('fs');
const path = require('path');
const mongoose = require('mongoose');

let embeddedMongoServer = null;
let shutdownHooksRegistered = false;

const stopEmbeddedMongo = async () => {
  if (embeddedMongoServer) {
    try {
      await embeddedMongoServer.stop();
    } catch (_err) {
      // Ignore cleanup errors on exit
    } finally {
      embeddedMongoServer = null;
    }
  }
};

const registerShutdownHooks = () => {
  if (shutdownHooksRegistered) return;
  shutdownHooksRegistered = true;

  const gracefulExit = async (signal) => {
    try {
      await mongoose.connection.close();
    } catch (_err) {
      // Ignore
    }
    await stopEmbeddedMongo();
    if (signal === 'SIGUSR2') {
      process.kill(process.pid, 'SIGUSR2');
    } else {
      process.exit(0);
    }
  };

  process.once('SIGINT', () => gracefulExit('SIGINT'));
  process.once('SIGTERM', () => gracefulExit('SIGTERM'));
  process.once('SIGUSR2', () => gracefulExit('SIGUSR2'));
};

const isLocalMongoUri = (uri) =>
  /^mongodb:\/\/(127\.0\.0\.1|localhost)(:\d+)?/i.test(uri);

const connectDB = async () => {
  const mongoUri = process.env.MONGO_URI || 'mongodb://127.0.0.1:27017/eduhub';

  try {
    const conn = await mongoose.connect(mongoUri, {
      serverSelectionTimeoutMS: 2500,
    });
    console.log(
      `[MongoDB] Connected successfully: ${conn.connection.host}/${conn.connection.name}`
    );
    return conn;
  } catch (error) {
    const canUseEmbeddedFallback =
      process.env.NODE_ENV !== 'production' && isLocalMongoUri(mongoUri);

    if (!canUseEmbeddedFallback) {
      console.error(`[MongoDB] Connection error: ${error.message}`);
      process.exit(1);
    }

    console.warn(
      `[MongoDB] Local MongoDB not running at ${mongoUri}. Starting embedded local MongoDB...`
    );

    try {
      const { MongoMemoryServer } = require('mongodb-memory-server');
      const dbPath = path.resolve(__dirname, '../../.mongodb-data');
      fs.mkdirSync(dbPath, { recursive: true });

      embeddedMongoServer = await MongoMemoryServer.create({
        instance: {
          dbPath,
          storageEngine: 'wiredTiger',
          dbName: 'eduhub',
        },
      });

      registerShutdownHooks();

      const embeddedUri = embeddedMongoServer.getUri('eduhub');
      const conn = await mongoose.connect(embeddedUri);

      console.log(
        `[MongoDB] Embedded local MongoDB ready (${embeddedUri}) — data persisted in backend/.mongodb-data`
      );

      // Ensure Admin account & sample catalog are seeded automatically when running locally
      const { seedInitialData } = require('../seed/seedData');
      await seedInitialData();

      return conn;
    } catch (fallbackError) {
      console.error(`[MongoDB] Failed to start embedded MongoDB: ${fallbackError.message}`);
      console.error(
        '[MongoDB] Please install & start MongoDB locally, or set a MongoDB Atlas MONGO_URI in backend/.env'
      );
      process.exit(1);
    }
  }
};

connectDB.stopEmbeddedMongo = stopEmbeddedMongo;

module.exports = connectDB;
