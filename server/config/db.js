import mongoose from 'mongoose';
import { enableEmbeddedPersistence } from './embeddedStore.js';

export const connectDB = async () => {
  const mongoUri = process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017/learnspace';

  try {
    const conn = await mongoose.connect(mongoUri, {
      serverSelectionTimeoutMS: 2500,
    });
    console.log(`[MongoDB] Connected to database: ${conn.connection.host}`);
    return { conn, usingEmbedded: false };
  } catch (primaryError) {
    console.warn(`[MongoDB] Could not connect to ${mongoUri} (${primaryError.message}).`);
    console.log(
      '[MongoDB] Activating built-in persistent local database engine (server/.mongo-data/learnspace-db.json)...'
    );
    enableEmbeddedPersistence();
    return { conn: mongoose.connection, usingEmbedded: true };
  }
};

export const disconnectDB = async () => {
  try {
    if (mongoose.connection.readyState === 1 && mongoose.connection.host) {
      await mongoose.disconnect();
    }
  } catch {
    // ignore
  }
};
