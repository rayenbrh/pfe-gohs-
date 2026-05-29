import { Router } from 'express';

import * as uploadController from '../controllers/upload.controller';
import { protect, restrictTo } from '../middleware/auth.middleware';
import { uploadLimiter } from '../middleware/rateLimiter.middleware';
import {
  avatarUpload,
  clientDocumentUpload,
  receiptUpload,
  vehicleImageUpload,
} from '../middleware/upload.middleware';
import { validate } from '../middleware/validate.middleware';
import {
  avatarQuerySchema,
  clientIdParamSchema,
  deleteVehicleImageSchema,
  maintenanceLogIdParamSchema,
  vehicleIdParamSchema,
} from '../validators/upload.validator';

const router = Router();

router.use(protect, uploadLimiter);

/**
 * @swagger
 * /uploads/vehicle/{vehicleId}/images:
 *   post:
 *     summary: Upload vehicle images to Cloudinary
 *     tags: [Uploads]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: vehicleId
 *         required: true
 *         schema: { type: string }
 *     requestBody:
 *       required: true
 *       content:
 *         multipart/form-data:
 *           schema:
 *             type: object
 *             properties:
 *               images:
 *                 type: array
 *                 items: { type: string, format: binary }
 *     responses:
 *       201:
 *         description: Updated vehicle images array
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ApiSuccess'
 *       413:
 *         description: File too large (max 5MB per image)
 */
router.post(
  '/vehicle/:vehicleId/images',
  restrictTo('admin', 'super_admin'),
  validate(vehicleIdParamSchema, 'params'),
  vehicleImageUpload,
  uploadController.uploadVehicleImages,
);

/**
 * @swagger
 * /uploads/vehicle/{vehicleId}/image:
 *   delete:
 *     summary: Remove a vehicle image from Cloudinary and the vehicle record
 *     tags: [Uploads]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: vehicleId
 *         required: true
 *         schema: { type: string }
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [imageUrl]
 *             properties:
 *               imageUrl: { type: string, format: uri }
 *     responses:
 *       200:
 *         description: Updated images array
 */
router.delete(
  '/vehicle/:vehicleId/image',
  restrictTo('admin', 'super_admin'),
  validate(vehicleIdParamSchema, 'params'),
  validate(deleteVehicleImageSchema),
  uploadController.deleteVehicleImage,
);

/**
 * @swagger
 * /uploads/client/{clientId}/id-document:
 *   post:
 *     summary: Upload client ID document
 *     tags: [Uploads]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: clientId
 *         required: true
 *         schema: { type: string }
 *     requestBody:
 *       content:
 *         multipart/form-data:
 *           schema:
 *             type: object
 *             properties:
 *               file: { type: string, format: binary }
 *     responses:
 *       201:
 *         description: Document URL
 */
router.post(
  '/client/:clientId/id-document',
  restrictTo('admin', 'super_admin', 'agent'),
  validate(clientIdParamSchema, 'params'),
  clientDocumentUpload,
  uploadController.uploadClientIdDocument,
);

/**
 * @swagger
 * /uploads/client/{clientId}/driver-license:
 *   post:
 *     summary: Upload client driver license
 *     tags: [Uploads]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: clientId
 *         required: true
 *         schema: { type: string }
 *     requestBody:
 *       content:
 *         multipart/form-data:
 *           schema:
 *             type: object
 *             properties:
 *               file: { type: string, format: binary }
 *     responses:
 *       201:
 *         description: Document URL
 */
router.post(
  '/client/:clientId/driver-license',
  restrictTo('admin', 'super_admin', 'agent'),
  validate(clientIdParamSchema, 'params'),
  clientDocumentUpload,
  uploadController.uploadClientDriverLicense,
);

/**
 * @swagger
 * /uploads/user/avatar:
 *   post:
 *     summary: Upload user avatar (own profile; super_admin may set userId query)
 *     tags: [Uploads]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: userId
 *         schema: { type: string }
 *         description: Target user ID (super_admin only)
 *     requestBody:
 *       content:
 *         multipart/form-data:
 *           schema:
 *             type: object
 *             properties:
 *               avatar: { type: string, format: binary }
 *     responses:
 *       201:
 *         description: Avatar URL
 */
router.post(
  '/user/avatar',
  validate(avatarQuerySchema, 'query'),
  avatarUpload,
  uploadController.uploadUserAvatar,
);

/**
 * @swagger
 * /uploads/maintenance/{logId}/receipt:
 *   post:
 *     summary: Upload maintenance receipt
 *     tags: [Uploads]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: logId
 *         required: true
 *         schema: { type: string }
 *     requestBody:
 *       content:
 *         multipart/form-data:
 *           schema:
 *             type: object
 *             properties:
 *               file: { type: string, format: binary }
 *     responses:
 *       201:
 *         description: Receipt URL
 */
router.post(
  '/maintenance/:logId/receipt',
  restrictTo('admin', 'super_admin', 'agent'),
  validate(maintenanceLogIdParamSchema, 'params'),
  receiptUpload,
  uploadController.uploadMaintenanceReceipt,
);

export default router;
