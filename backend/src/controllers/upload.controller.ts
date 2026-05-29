import type { Request, Response } from 'express';

import { cloudinary, isCloudinaryConfigured } from '../config/cloudinary';
import Client from '../models/Client';
import MaintenanceLog from '../models/MaintenanceLog';
import User from '../models/User';
import Vehicle from '../models/Vehicle';
import { AppError } from '../utils/AppError';
import { catchAsync } from '../utils/catchAsync';
import { extractCloudinaryPublicId } from '../utils/cloudinaryHelpers';

type CloudinaryFile = Express.Multer.File & { path: string };

function getUploadedUrls(files: Express.Multer.File | Express.Multer.File[] | undefined): string[] {
  if (!files) return [];
  const list = Array.isArray(files) ? files : [files];
  return list
    .map((f) => {
      const cloudinaryUrl = (f as CloudinaryFile).path;
      if (cloudinaryUrl) return cloudinaryUrl;
      if (!isCloudinaryConfigured()) return null;
      return null;
    })
    .filter((url): url is string => Boolean(url));
}

function getSingleUrl(file: Express.Multer.File | undefined): string {
  if (!file) throw new AppError('No file uploaded', 400, 'NO_FILE');
  const url = (file as CloudinaryFile).path;
  if (!url) throw new AppError('Upload failed', 500, 'UPLOAD_FAILED');
  return url;
}

export const uploadVehicleImages = catchAsync(async (req: Request, res: Response) => {
  if (!isCloudinaryConfigured()) {
    throw new AppError('Cloudinary is not configured', 503, 'CLOUDINARY_NOT_CONFIGURED');
  }

  const urls = getUploadedUrls(req.files as Express.Multer.File[]);
  if (urls.length === 0) throw new AppError('No files uploaded', 400, 'NO_FILE');

  const vehicle = await Vehicle.findOne({ _id: req.params.vehicleId, isActive: { $ne: false } });
  if (!vehicle) throw new AppError('Vehicle not found', 404, 'VEHICLE_NOT_FOUND');

  vehicle.images.push(...urls);
  await vehicle.save();

  res.status(201).json({ success: true, data: { images: vehicle.images } });
});

export const deleteVehicleImage = catchAsync(async (req: Request, res: Response) => {
  if (!isCloudinaryConfigured()) {
    throw new AppError('Cloudinary is not configured', 503, 'CLOUDINARY_NOT_CONFIGURED');
  }

  const { imageUrl } = req.body as { imageUrl: string };

  const vehicle = await Vehicle.findOne({ _id: req.params.vehicleId, isActive: { $ne: false } });
  if (!vehicle) throw new AppError('Vehicle not found', 404, 'VEHICLE_NOT_FOUND');

  if (!vehicle.images.includes(imageUrl)) {
    throw new AppError('Image not found on this vehicle', 404, 'IMAGE_NOT_FOUND');
  }

  const publicId = extractCloudinaryPublicId(imageUrl);
  await cloudinary.uploader.destroy(publicId);

  vehicle.images = vehicle.images.filter((url) => url !== imageUrl);
  await vehicle.save();

  res.json({ success: true, data: { images: vehicle.images } });
});

export const uploadClientIdDocument = catchAsync(async (req: Request, res: Response) => {
  if (!isCloudinaryConfigured()) {
    throw new AppError('Cloudinary is not configured', 503, 'CLOUDINARY_NOT_CONFIGURED');
  }

  const url = getSingleUrl(req.file);
  const client = await Client.findOne({ _id: req.params.clientId, isActive: { $ne: false } });
  if (!client) throw new AppError('Client not found', 404, 'CLIENT_NOT_FOUND');

  client.idDocumentUrl = url;
  await client.save();

  res.status(201).json({ success: true, data: { url } });
});

export const uploadClientDriverLicense = catchAsync(async (req: Request, res: Response) => {
  if (!isCloudinaryConfigured()) {
    throw new AppError('Cloudinary is not configured', 503, 'CLOUDINARY_NOT_CONFIGURED');
  }

  const url = getSingleUrl(req.file);
  const client = await Client.findOne({ _id: req.params.clientId, isActive: { $ne: false } });
  if (!client) throw new AppError('Client not found', 404, 'CLIENT_NOT_FOUND');

  client.driverLicenseUrl = url;
  await client.save();

  res.status(201).json({ success: true, data: { url } });
});

export const uploadUserAvatar = catchAsync(async (req: Request, res: Response) => {
  if (!isCloudinaryConfigured()) {
    throw new AppError('Cloudinary is not configured', 503, 'CLOUDINARY_NOT_CONFIGURED');
  }

  const url = getSingleUrl(req.file);
  const requester = req.user!;
  const targetUserId =
    requester.role === 'super_admin' && req.query.userId
      ? String(req.query.userId)
      : requester._id;

  if (targetUserId !== requester._id && requester.role !== 'super_admin') {
    throw new AppError('You can only update your own avatar', 403, 'FORBIDDEN');
  }

  const user = await User.findById(targetUserId);
  if (!user || user.isActive === false) {
    throw new AppError('User not found', 404, 'USER_NOT_FOUND');
  }

  user.avatar = url;
  await user.save();

  res.status(201).json({ success: true, data: { url, userId: user._id } });
});

export const uploadMaintenanceReceipt = catchAsync(async (req: Request, res: Response) => {
  if (!isCloudinaryConfigured()) {
    throw new AppError('Cloudinary is not configured', 503, 'CLOUDINARY_NOT_CONFIGURED');
  }

  const url = getSingleUrl(req.file);
  const log = await MaintenanceLog.findById(req.params.logId);
  if (!log) throw new AppError('Maintenance log not found', 404, 'MAINTENANCE_NOT_FOUND');

  log.receiptUrl = url;
  await log.save();

  res.status(201).json({ success: true, data: { url } });
});
