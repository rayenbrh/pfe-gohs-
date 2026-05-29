import { Router } from 'express';

import * as paymentController from '../controllers/payment.controller';
import { requireRole, verifyToken } from '../middleware/auth.middleware';
import { validate } from '../middleware/validate.middleware';
import {
  initPaymentSchema,
  konnectWebhookSchema,
  paymentRefParamSchema,
} from '../validators/payment.validator';

const router = Router();

/**
 * @openapi
 * /payments/webhook:
 *   post:
 *     tags: [Payments]
 *     summary: Konnect payment webhook (public)
 */
router.post('/webhook', validate(konnectWebhookSchema), paymentController.konnectWebhook);

/**
 * @openapi
 * /payments/init:
 *   post:
 *     tags: [Payments]
 *     summary: Initiate Konnect payment for a pending reservation (public)
 */
router.post('/init', validate(initPaymentSchema), paymentController.initPayment);

/**
 * @openapi
 * /payments/verify/{paymentRef}:
 *   get:
 *     tags: [Payments]
 *     summary: Verify payment status with Konnect (public)
 */
router.get(
  '/verify/:paymentRef',
  validate(paymentRefParamSchema, 'params'),
  paymentController.verifyPayment,
);

router.use(verifyToken, requireRole('admin', 'super_admin'));

/**
 * @openapi
 * /payments/history:
 *   get:
 *     tags: [Payments]
 *     summary: Payment history (admin)
 */
router.get('/history', paymentController.getPaymentHistory);

export default router;
