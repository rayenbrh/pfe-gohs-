import { Router } from 'express';

import * as reservationController from '../controllers/reservation.controller';
import { requireRole, verifyToken } from '../middleware/auth.middleware';
import { validate } from '../middleware/validate.middleware';
import {
  calendarQuerySchema,
  createReservationSchema,
  reservationIdSchema,
  updateReservationFieldsSchema,
  updateStatusSchema,
} from '../validators/reservation.validator';

const router = Router();

router.use(verifyToken);

/**
 * @openapi
 * /reservations:
 *   get:
 *     tags: [Reservations]
 *     summary: List reservations (paginated, filterable)
 *     security:
 *       - bearerAuth: []
 */
router.get(
  '/',
  requireRole('admin', 'admin', 'employee'),
  reservationController.getReservations,
);

/**
 * @openapi
 * /reservations/calendar:
 *   get:
 *     tags: [Reservations]
 *     summary: Calendar view for a given month
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: month
 *         required: true
 *         schema: { type: string, example: '2026-06' }
 */
router.get(
  '/calendar',
  validate(calendarQuerySchema, 'query'),
  reservationController.getCalendar,
);

/**
 * @openapi
 * /reservations/{id}:
 *   get:
 *     tags: [Reservations]
 *     summary: Get reservation details with contract and invoice
 *     security:
 *       - bearerAuth: []
 */
router.get(
  '/:id',
  validate(reservationIdSchema, 'params'),
  reservationController.getReservation,
);

/**
 * @openapi
 * /reservations:
 *   post:
 *     tags: [Reservations]
 *     summary: Create a new reservation
 *     security:
 *       - bearerAuth: []
 */
router.post(
  '/',
  requireRole('admin', 'admin', 'employee'),
  validate(createReservationSchema),
  reservationController.createReservation,
);

/**
 * @openapi
 * /reservations/{id}/status:
 *   patch:
 *     tags: [Reservations]
 *     summary: Update reservation status (workflow transitions)
 *     security:
 *       - bearerAuth: []
 */
router.patch(
  '/:id/status',
  requireRole('admin', 'admin', 'employee'),
  validate(reservationIdSchema, 'params'),
  validate(updateStatusSchema),
  reservationController.updateStatus,
);

/**
 * @openapi
 * /reservations/{id}:
 *   patch:
 *     tags: [Reservations]
 *     summary: Update mutable reservation fields (admin only)
 *     security:
 *       - bearerAuth: []
 */
router.patch(
  '/:id',
  requireRole('admin', 'admin'),
  validate(reservationIdSchema, 'params'),
  validate(updateReservationFieldsSchema),
  reservationController.updateReservation,
);

/**
 * @openapi
 * /reservations/{id}:
 *   delete:
 *     tags: [Reservations]
 *     summary: Hard-delete a cancelled reservation (super_admin only)
 *     security:
 *       - bearerAuth: []
 */
router.delete(
  '/:id',
  requireRole('admin'),
  validate(reservationIdSchema, 'params'),
  reservationController.deleteReservation,
);

export default router;

