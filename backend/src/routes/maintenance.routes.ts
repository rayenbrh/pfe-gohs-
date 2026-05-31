import { Router } from 'express';

import * as maintenanceController from '../controllers/maintenance.controller';
import { protect, restrictTo } from '../middleware/auth.middleware';
import { validate } from '../middleware/validate.middleware';
import {
  createMaintenanceSchema,
  maintenanceIdSchema,
  updateMaintenanceSchema,
  vehicleIdParamSchema,
} from '../validators/maintenance.validator';

const router = Router();

router.use(protect);

/**
 * @swagger
 * /maintenance:
 *   get:
 *     summary: List maintenance logs or upcoming vehicles (?upcoming=true)
 *     tags: [Maintenance]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: vehicleId
 *         schema: { type: string }
 *       - in: query
 *         name: type
 *         schema:
 *           type: string
 *           enum: [scheduled, repair, inspection, tire_change, oil_change]
 *       - in: query
 *         name: upcoming
 *         schema: { type: boolean }
 *       - $ref: '#/components/parameters/PageParam'
 *       - $ref: '#/components/parameters/LimitParam'
 *     responses:
 *       200:
 *         description: Maintenance logs or upcoming vehicles
 */
router.get(
  '/',
  restrictTo('admin', 'admin'),
  maintenanceController.getMaintenanceLogs,
);

/**
 * @swagger
 * /maintenance/vehicle/{vehicleId}:
 *   get:
 *     summary: Full maintenance history for a vehicle with cost summary
 *     tags: [Maintenance]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: vehicleId
 *         required: true
 *         schema: { type: string }
 *     responses:
 *       200:
 *         description: Vehicle maintenance history
 */
router.get(
  '/vehicle/:vehicleId',
  restrictTo('admin', 'admin'),
  validate(vehicleIdParamSchema, 'params'),
  maintenanceController.getVehicleMaintenanceHistory,
);

/**
 * @swagger
 * /maintenance/{id}:
 *   get:
 *     summary: Get maintenance log by ID
 *     tags: [Maintenance]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema: { type: string }
 *     responses:
 *       200:
 *         description: Maintenance log details
 */
router.get(
  '/:id',
  restrictTo('admin', 'admin'),
  validate(maintenanceIdSchema, 'params'),
  maintenanceController.getMaintenanceLog,
);

/**
 * @swagger
 * /maintenance:
 *   post:
 *     summary: Create a maintenance log entry
 *     tags: [Maintenance]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/MaintenanceLog'
 *     responses:
 *       201:
 *         description: Maintenance log created
 */
router.post(
  '/',
  restrictTo('admin', 'admin', 'employee'),
  validate(createMaintenanceSchema),
  maintenanceController.createMaintenanceLog,
);

/**
 * @swagger
 * /maintenance/{id}:
 *   patch:
 *     summary: Update maintenance log
 *     tags: [Maintenance]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema: { type: string }
 *     responses:
 *       200:
 *         description: Maintenance log updated
 */
router.patch(
  '/:id',
  restrictTo('admin', 'admin'),
  validate(maintenanceIdSchema, 'params'),
  validate(updateMaintenanceSchema),
  maintenanceController.updateMaintenanceLog,
);

/**
 * @swagger
 * /maintenance/{id}:
 *   delete:
 *     summary: Hard-delete maintenance log (super_admin)
 *     tags: [Maintenance]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema: { type: string }
 *     responses:
 *       204:
 *         description: Maintenance log deleted
 */
router.delete(
  '/:id',
  restrictTo('admin'),
  validate(maintenanceIdSchema, 'params'),
  maintenanceController.deleteMaintenanceLog,
);

export default router;

