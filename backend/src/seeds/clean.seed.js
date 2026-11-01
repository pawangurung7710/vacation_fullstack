import dotenv from 'dotenv';
import mongoose from 'mongoose';
import connectDB from '../config/db.js';

dotenv.config();

const cleanDatabase = async () => {
  try {
    await connectDB();
    await mongoose.connection.dropDatabase();
    console.log('Database cleanup complete.');
    process.exit(0);
  } catch (error) {
    console.error('Error cleaning database:', error);
    process.exit(1);
  }
};

cleanDatabase();
