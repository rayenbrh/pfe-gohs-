import { v2 as cloudinary } from 'cloudinary';

import logger from './logger';

let configured = false;

export function configureCloudinary(): void {
  const cloudName = process.env.CLOUDINARY_CLOUD_NAME;
  const apiKey = process.env.CLOUDINARY_API_KEY;
  const apiSecret = process.env.CLOUDINARY_API_SECRET;

  if (!cloudName || !apiKey || !apiSecret) {
    logger.warn('Cloudinary credentials not set — upload features disabled');
    return;
  }

  cloudinary.config({
    cloud_name: cloudName,
    api_key: apiKey,
    api_secret: apiSecret,
    secure: true,
  });

  configured = true;
  logger.info('Cloudinary configured');
}

export function isCloudinaryConfigured(): boolean {
  return configured;
}

export { cloudinary };
