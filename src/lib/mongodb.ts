/**
 * @fileoverview MongoDB connection utility with connection caching
 * @version 1.0.0
 * @created 2025-09-26
 */

import mongoose from 'mongoose';
import { log } from '@/lib/logger';

/**
 * OVERVIEW:
 * This module provides a singleton MongoDB connection utility that manages
 * database connections efficiently in Next.js serverless environments.
 * It implements connection caching to prevent multiple connections during
 * development hot reloads and optimizes performance in production.
 */

interface ConnectionCache {
  conn: typeof mongoose | null;
  promise: Promise<typeof mongoose> | null;
}

// Global cache to store connection across hot reloads
declare global {
  // eslint-disable-next-line no-var
  var mongoose: ConnectionCache;
}

// Initialize cache
let cached = global.mongoose;
if (!cached) {
    cached = global.mongoose = { conn: null, promise: null };
}

/**
 * Establishes a cached MongoDB connection
 * @returns Promise that resolves to mongoose instance
 * @throws Error if MONGODB_URI is not defined or connection fails
 */
export async function connectToDatabase(): Promise<typeof mongoose> {
  // Return existing connection if available
  if (cached.conn) {
    return cached.conn;
  }

  // Validate environment variable
  if (!process.env.MONGODB_URI) {
    throw new Error('MONGODB_URI environment variable is not defined');
  }

  // Create connection promise if it doesn't exist
  if (!cached.promise) {
    const opts = {
      bufferCommands: false,
      serverSelectionTimeoutMS: 10000, // 10 seconds timeout
      socketTimeoutMS: 45000, // 45 seconds socket timeout
      family: 4, // Use IPv4, skip trying IPv6
    };

    cached.promise = mongoose.connect(process.env.MONGODB_URI, opts).then((mongoose) => {
      log.info('MongoDB connected successfully');
      return mongoose;
    });
  }

  try {
    cached.conn = await cached.promise;
  } catch (error) {
    cached.promise = null;
    log.error('MongoDB connection error', error);
    throw error;
  }

  return cached.conn;
}

/**
 * Closes the MongoDB connection
 * @returns Promise that resolves when connection is closed
 */
export async function disconnectFromDatabase(): Promise<void> {
  if (cached.conn) {
    await cached.conn.disconnect();
    cached.conn = null;
    cached.promise = null;
    log.info('MongoDB disconnected');
  }
}

/**
 * Gets the current connection status
 * @returns Boolean indicating if database is connected
 */
export function isDatabaseConnected(): boolean {
  return cached.conn?.connection.readyState === 1;
}

/**
 * Usage Example:
 * ```typescript
 * import { connectToDatabase } from '@/lib/mongodb';
 * 
 * export async function handler() {
 *   await connectToDatabase();
 *   // Your database operations here
 * }
 * ```
 */

/* 
 * File: /src/lib/mongodb.ts
 * Created: 2025-09-26
 * Modified: 2025-09-26
 */