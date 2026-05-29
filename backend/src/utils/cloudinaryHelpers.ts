import { AppError } from './AppError';

/**
 * Extract Cloudinary public_id from a secure_url or URL path.
 * e.g. .../upload/v123/inova-ride/vehicles/abc.jpg → inova-ride/vehicles/abc
 */
export function extractCloudinaryPublicId(imageUrl: string): string {
  try {
    const uploadSegment = '/upload/';
    const idx = imageUrl.indexOf(uploadSegment);
    if (idx === -1) {
      throw new Error('missing upload segment');
    }
    let path = imageUrl.slice(idx + uploadSegment.length);
    path = path.replace(/^[^/]+\//, ''); // strip version or transformation prefix
    if (path.startsWith('v') && /^\d+/.test(path.slice(1))) {
      path = path.replace(/^v\d+\//, '');
    }
    return path.replace(/\.[^/.]+$/, '');
  } catch {
    throw new AppError('Invalid Cloudinary image URL', 400, 'INVALID_CLOUDINARY_URL');
  }
}
