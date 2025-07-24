// Load environment variables if running outside of Next.js
if (typeof window === 'undefined' && !process.env.MONGODB_URI) {
  try {
    const { config } = require('dotenv');
    config({ path: '.env.local' });
  } catch (error) {
    // dotenv might not be available in production
  }
}

import mongoose from 'mongoose';
import './models'; // Register all models

declare global {
  var mongoose: any; // This must be a `var` and not a `let` / `const`
}

const MONGODB_URI = process.env.MONGODB_URI!;

if (!MONGODB_URI) {
  throw new Error(
    'Please define the MONGODB_URI environment variable inside .env.local'
  );
}

/**
 * Global is used here to maintain a cached connection across hot reloads
 * in development. This prevents connections growing exponentially
 * during API Route usage.
 */
let cached = global.mongoose;

if (!cached) {
  cached = global.mongoose = { conn: null, promise: null };
}

async function dbConnect() {
  if (cached.conn) {
    return cached.conn;
  }

  if (!cached.promise) {
    const opts = {
      bufferCommands: false,
    };

    cached.promise = mongoose.connect(MONGODB_URI, opts).then((mongoose) => {
      return mongoose;
    });
  }

  try {
    cached.conn = await cached.promise;
  } catch (e) {
    cached.promise = null;
    throw e;
  }

  return cached.conn;
}

export default dbConnect;
