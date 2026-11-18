require('dotenv').config();
const mongoose = require('mongoose');
const connectDB = require('../config/db');
const { seedInitialData } = require('./seedData');

const runSeed = async () => {
  try {
    await connectDB();
    await seedInitialData();
    console.log('[Seed] Database seeding complete!');
  } catch (error) {
    console.error('[Seed Error]', error);
    process.exitCode = 1;
  } finally {
    await mongoose.connection.close();
    if (connectDB.stopEmbeddedMongo) {
      await connectDB.stopEmbeddedMongo();
    }
  }
};

runSeed();
