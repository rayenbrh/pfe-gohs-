import { Router } from 'express';

import * as adminController from '../controllers/admin.controller';
import { protect, restrictTo } from '../middleware/auth.middleware';

const router = Router();

/**
 * @swagger
 * /admin/health:
 *   get:
 *     summary: Admin service health check
 *     tags: [Admin]
 *     responses:
 *       200:
 *         description: Service health status
 */
router.get('/health', adminController.getHealth);

router.use(protect, restrictTo('admin', 'employee'));

/**
 * @swagger
 * /admin/stats:
 *   get:
 *     summary: Dashboard KPI statistics
 *     tags: [Admin]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Dashboard stats
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ApiSuccess'
 */
router.get('/stats', adminController.getStats);

/**
 * @swagger
 * /admin/charts/revenue:
 *   get:
 *     summary: Revenue chart by month
 *     tags: [Admin]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: period
 *         schema:
 *           type: string
 *           enum: [12months, 6months, 3months]
 *           default: 12months
 *     responses:
 *       200:
 *         description: Monthly revenue data points
 */
router.get('/charts/revenue', adminController.getRevenueChartHandler);

/**
 * @swagger
 * /admin/charts/reservations:
 *   get:
 *     summary: Reservations grouped by status
 *     tags: [Admin]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Reservation status counts
 */
router.get('/charts/reservations', adminController.getReservationsChartHandler);

/**
 * @swagger
 * /admin/charts/vehicles-by-category:
 *   get:
 *     summary: Fleet breakdown by category
 *     tags: [Admin]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Vehicle counts per category
 */
router.get('/charts/vehicles-by-category', adminController.getVehiclesByCategoryHandler);

/**
 * @swagger
 * /admin/reports/monthly:
 *   get:
 *     summary: Full monthly report for PDF export
 *     tags: [Admin]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: month
 *         required: true
 *         schema: { type: string, example: '2026-06' }
 *     responses:
 *       200:
 *         description: Monthly report data
 */
router.get('/reports/monthly', adminController.getMonthlyReportHandler);

/**
 * @swagger
 * /admin/fleet/availability:
 *   get:
 *     summary: Fleet availability overview grouped by category
 *     tags: [Admin]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Fleet availability snapshot
 */
router.get('/fleet/availability', adminController.getFleetAvailabilityHandler);

export default router;
