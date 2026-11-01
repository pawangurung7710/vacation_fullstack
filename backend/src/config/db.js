import mongoose from 'mongoose';
import dotenv from 'dotenv';

dotenv.config();

const connectDB = async () => {
  try {
    const conn = await mongoose.connect(process.env.MONGO_URI, {
      // Keep a warm pool so requests don't pay connection setup, but stay well under the
      // M0 free-tier 500-connection ceiling (shared across every app on this cluster).
      maxPoolSize: Number(process.env.MONGO_MAX_POOL || 10),
      minPoolSize: Number(process.env.MONGO_MIN_POOL || 2),
      serverSelectionTimeoutMS: 5000,
      socketTimeoutMS: 45000,
    });

    console.log(`MongoDB Connected: ${conn.connection.host}`);
  } catch (error) {
    console.error(`Error: ${error.message}`);
    process.exit(1);
  }
};

export default connectDB;

