import { Router } from 'express';

import * as vehicleController from '../controllers/vehicle.controller';
import { requireRole, verifyToken } from '../middleware/auth.middleware';
import { validate } from '../middleware/validate.middleware';
import {
  availabilityQuerySchema,
  createVehicleSchema,
  updateAvailabilitySchema,
  updateVehicleSchema,
  vehicleIdSchema,
} from '../validators/vehicle.validator';

const router = Router();

/**
 * @openapi
 * /vehicles:
 *   get:
 *     tags: [Vehicles]
 *     summary: List vehicles (public fleet page)
 *     parameters:
 *       - in: query
 *         name: category
 *         schema: { type: string }
 *       - in: query
 *         name: search
 *         schema: { type: string }
 *       - in: query
 *         name: page
 *         schema: { type: integer }
 *       - in: query
 *         name: limit
 *         schema: { type: integer }
 *     responses:
 *       200:
 *         description: Paginated vehicle list
 */
router.get('/', vehicleController.getVehicles);

/**
 * @openapi
 * /vehicles/availability:
 *   get:
 *     tags: [Vehicles]
 *     summary: Get vehicles available for a date range
 *     parameters:
 *       - in: query
 *         name: startDate
 *         required: true
 *         schema: { type: string, format: date-time }
 *       - in: query
 *         name: endDate
 *         required: true
 *         schema: { type: string, format: date-time }
 *       - in: query
 *         name: category
 *         schema: { type: string }
 *     responses:
 *       200:
 *         description: Available vehicles
 */
router.get(
  '/availability',
  validate(availabilityQuerySchema, 'query'),
  vehicleController.getAvailability,
);

/**
 * @openapi
 * /vehicles/{id}/reservations:
 *   get:
 *     tags: [Vehicles]
 *     summary: List reservations for a vehicle
 *     security:
 *       - bearerAuth: []
 */
router.get(
  '/:id/reservations',
  verifyToken,
  requireRole('admin', 'super_admin', 'agent'),
  validate(vehicleIdSchema, 'params'),
  vehicleController.getVehicleReservations,
);

/**
 * @openapi
 * /vehicles/{id}/maintenance:
 *   get:
 *     tags: [Vehicles]
 *     summary: List maintenance logs for a vehicle
 *     security:
 *       - bearerAuth: []
 */
router.get(
  '/:id/maintenance',
  verifyToken,
  requireRole('admin', 'super_admin', 'agent'),
  validate(vehicleIdSchema, 'params'),
  vehicleController.getVehicleMaintenance,
);

/**
 * @openapi
 * /vehicles/{id}:
 *   get:
 *     tags: [Vehicles]
 *     summary: Get vehicle by ID
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema: { type: string }
 *     responses:
 *       200:
 *         description: Vehicle details
 *       404:
 *         description: Vehicle not found
 */
router.get('/:id', validate(vehicleIdSchema, 'params'), vehicleController.getVehicle);

/**
 * @openapi
 * /vehicles:
 *   post:
 *     tags: [Vehicles]
 *     summary: Create a vehicle (admin only)
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       201:
 *         description: Vehicle created
 */
router.post(
  '/',
  verifyToken,
  requireRole('admin', 'super_admin'),
  validate(createVehicleSchema),
  vehicleController.createVehicle,
);

/**
 * @openapi
 * /vehicles/{id}/availability:
 *   patch:
 *     tags: [Vehicles]
 *     summary: Toggle vehicle availability
 *     security:
 *       - bearerAuth: []
 */
router.patch(
  '/:id/availability',
  verifyToken,
  requireRole('admin', 'super_admin', 'agent'),
  validate(vehicleIdSchema, 'params'),
  validate(updateAvailabilitySchema),
  vehicleController.updateAvailability,
);

/**
 * @openapi
 * /vehicles/{id}:
 *   patch:
 *     tags: [Vehicles]
 *     summary: Update a vehicle (admin only)
 *     security:
 *       - bearerAuth: []
 */
router.patch(
  '/:id',
  verifyToken,
  requireRole('admin', 'super_admin'),
  validate(vehicleIdSchema, 'params'),
  validate(updateVehicleSchema),
  vehicleController.updateVehicle,
);

/**
 * @openapi
 * /vehicles/{id}:
 *   delete:
 *     tags: [Vehicles]
 *     summary: Soft-delete a vehicle (super_admin only)
 *     security:
 *       - bearerAuth: []
 */
router.delete(
  '/:id',
  verifyToken,
  requireRole('super_admin'),
  validate(vehicleIdSchema, 'params'),
  vehicleController.deleteVehicle,
);

export default router;
