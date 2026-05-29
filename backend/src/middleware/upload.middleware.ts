import type { Request, RequestHandler, Response, NextFunction } from 'express';
import multer from 'multer';
import { CloudinaryStorage } from 'multer-storage-cloudinary';

import { cloudinary, isCloudinaryConfigured } from '../config/cloudinary';
import { AppError } from '../utils/AppError';

const IMAGE_MIMES = ['image/jpeg', 'image/png', 'image/webp'];
const DOC_MIMES = [...IMAGE_MIMES, 'application/pdf'];

function createStorage(params: Record<string, unknown>): multer.StorageEngine {
  if (!isCloudinaryConfigured()) {
    return multer.memoryStorage();
  }
  return new CloudinaryStorage({ cloudinary, params }) as unknown as multer.StorageEngine;
}

const imageFileFilter: multer.Options['fileFilter'] = (_req, file, cb) => {
  if (IMAGE_MIMES.includes(file.mimetype)) {
    cb(null, true);
  } else {
    cb(new AppError('Only JPEG, PNG and WebP images are allowed', 400, 'INVALID_FILE_TYPE'));
  }
};

const documentFileFilter: multer.Options['fileFilter'] = (_req, file, cb) => {
  if (DOC_MIMES.includes(file.mimetype)) {
    cb(null, true);
  } else {
    cb(
      new AppError(
        'Only JPEG, PNG, WebP images and PDF documents are allowed',
        400,
        'INVALID_FILE_TYPE',
      ),
    );
  }
};

function wrapMulter(middleware: RequestHandler): RequestHandler {
  return (req: Request, res: Response, next: NextFunction) => {
    middleware(req, res, (err: unknown) => {
      if (err) next(err);
      else next();
    });
  };
}

function buildVehicleImageUpload(): RequestHandler {
  const storage = createStorage({
    folder: 'inova-ride/vehicles',
    allowed_formats: ['jpg', 'jpeg', 'png', 'webp'],
    transformation: [{ width: 1200, height: 800, crop: 'fill', quality: 'auto' }],
  });
  return multer({
    storage,
    fileFilter: imageFileFilter,
    limits: { fileSize: 5 * 1024 * 1024, files: 8 },
  }).array('images', 8);
}

function buildClientDocumentUpload(): RequestHandler {
  const storage = createStorage({
    folder: 'inova-ride/client-documents',
    allowed_formats: ['jpg', 'jpeg', 'png', 'pdf'],
    resource_type: 'auto',
  });
  return multer({
    storage,
    fileFilter: documentFileFilter,
    limits: { fileSize: 10 * 1024 * 1024, files: 1 },
  }).single('file');
}

function buildReceiptUpload(): RequestHandler {
  const storage = createStorage({
    folder: 'inova-ride/receipts',
    allowed_formats: ['jpg', 'jpeg', 'png', 'pdf'],
    resource_type: 'auto',
  });
  return multer({
    storage,
    fileFilter: documentFileFilter,
    limits: { fileSize: 10 * 1024 * 1024, files: 1 },
  }).single('file');
}

function buildAvatarUpload(): RequestHandler {
  const storage = createStorage({
    folder: 'inova-ride/avatars',
    allowed_formats: ['jpg', 'jpeg', 'png', 'webp'],
    transformation: [{ width: 200, height: 200, crop: 'fill', gravity: 'face' }],
  });
  return multer({
    storage,
    fileFilter: imageFileFilter,
    limits: { fileSize: 2 * 1024 * 1024, files: 1 },
  }).single('avatar');
}

export const vehicleImageUpload = wrapMulter((req, res, next) =>
  buildVehicleImageUpload()(req, res, next),
);

export const clientDocumentUpload = wrapMulter((req, res, next) =>
  buildClientDocumentUpload()(req, res, next),
);

export const receiptUpload = wrapMulter((req, res, next) =>
  buildReceiptUpload()(req, res, next),
);

export const avatarUpload = wrapMulter((req, res, next) => buildAvatarUpload()(req, res, next));

/** @deprecated Generic upload — use entity-specific upload middleware */
export const uploadSingle = (fieldName: string) =>
  wrapMulter(
    multer({
      storage: createStorage({ folder: 'inova-ride', resource_type: 'auto' }),
      fileFilter: documentFileFilter,
      limits: { fileSize: 10 * 1024 * 1024 },
    }).single(fieldName),
  );
