import mongoose from 'mongoose';

import logger from './logger';

const MAX_RETRIES = 5;
const RETRY_DELAY_MS = 5000;

let isConnecting = false;

export async function connectDB(): Promise<void> {
  const uri = process.env.MONGODB_URI;

  if (!uri) {
    logger.error('MONGODB_URI is not defined in environment variables');
    process.exit(1);
  }

  if (isConnecting) return;
  isConnecting = true;

  mongoose.set('strictQuery', true);

  for (let attempt = 1; attempt <= MAX_RETRIES; attempt++) {
    try {
      await mongoose.connect(uri, {
        maxPoolSize: 10,
        serverSelectionTimeoutMS: 5000,
      });

      const host = mongoose.connection.host ?? 'unknown';
      logger.info(`MongoDB connected: ${host}`);

      mongoose.connection.removeAllListeners('disconnected');
      mongoose.connection.removeAllListeners('error');

      mongoose.connection.on('disconnected', () => {
        logger.warn('MongoDB disconnected, attempting reconnect...');
        void reconnectDB();
      });

      mongoose.connection.on('error', (err) => {
        logger.error(err);
      });

      isConnecting = false;
      return;
    } catch (error) {
      logger.error(error instanceof Error ? error : new Error(String(error)));

      if (attempt < MAX_RETRIES) {
        logger.warn(`MongoDB connection attempt ${attempt}/${MAX_RETRIES} — retrying in ${RETRY_DELAY_MS / 1000}s`);
        await new Promise((resolve) => setTimeout(resolve, RETRY_DELAY_MS));
      }
    }
  }

  isConnecting = false;
  logger.error(`MongoDB connection failed after ${MAX_RETRIES} attempts`);
  process.exit(1);
}

async function reconnectDB(): Promise<void> {
  if (mongoose.connection.readyState === 1 || isConnecting) return;

  try {
    isConnecting = true;
    await mongoose.connect(process.env.MONGODB_URI!, {
      maxPoolSize: 10,
      serverSelectionTimeoutMS: 5000,
    });
    logger.info(`MongoDB reconnected: ${mongoose.connection.host}`);
  } catch (error) {
    logger.error(error instanceof Error ? error : new Error(String(error)));
    setTimeout(() => void reconnectDB(), RETRY_DELAY_MS);
  } finally {
    isConnecting = false;
  }
}

export async function disconnectDB(): Promise<void> {
  await mongoose.disconnect();
  logger.info('MongoDB disconnected');
}
