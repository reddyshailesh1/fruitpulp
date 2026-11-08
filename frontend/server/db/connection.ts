import mongoose from 'mongoose';
import { env } from '../config/env';

export async function connectDB(): Promise<typeof mongoose | null> {
  if (mongoose.connection.readyState >= 1) {
    return mongoose;
  }

  const uri = process.env.MONGODB_URI || env.MONGODB_URI;

  if (!uri) {
    console.warn('⚠️ No MONGODB_URI set. Operating with in-memory resilient fallback.');
    return null;
  }

  try {
    const conn = await mongoose.connect(uri, {
      autoIndex: true,
      serverSelectionTimeoutMS: 5000,
    });
    console.log(`🥭 MongoDB connected successfully: ${conn.connection.host}`);
    return conn;
  } catch (error) {
    console.warn('⚠️ MongoDB connection warning. Operating with fallback storage:', error);
    return null;
  }
}

export async function disconnectDB(): Promise<void> {
  if (mongoose.connection.readyState !== 0) {
    await mongoose.disconnect();
  }
}

export async function clearDB(): Promise<void> {
  if (mongoose.connection.readyState >= 1) {
    const collections = mongoose.connection.collections;
    for (const key in collections) {
      const collection = collections[key];
      await collection.deleteMany({});
    }
  }
}
