import mongoose from 'mongoose';

let conn: typeof mongoose | null = null;

export const executeConnection = async () => {
  if (conn) {
    console.log('Using existing database connection');
    return conn;
  }

  if (!process.env.MONGODB_URI) {
    throw new Error('MONGODB_URI is not defined in environment variables');
  }

  try {
    console.log('Creating new database connection');
    conn = await mongoose.connect(process.env.MONGODB_URI, {
        serverSelectionTimeoutMS: 5000
    });
    return conn;
  } catch (error) {
    console.error('Error connecting to database', error);
    throw error;
  }
};
