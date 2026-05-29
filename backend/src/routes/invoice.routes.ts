import { Router } from 'express';

import * as invoiceController from '../controllers/invoice.controller';
import { requireRole, verifyToken } from '../middleware/auth.middleware';
import { validate } from '../middleware/validate.middleware';
import {
  createInvoiceSchema,
  invoiceIdSchema,
  updateInvoiceStatusSchema,
} from '../validators/invoice.validator';

const router = Router();

router.use(verifyToken);

/**
 * @swagger
 * /invoices:
 *   get:
 *     summary: List invoices (paginated)
 *     tags: [Invoices]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - $ref: '#/components/parameters/PageParam'
 *       - $ref: '#/components/parameters/LimitParam'
 *     responses:
 *       200:
 *         description: Paginated invoices
 */
router.get('/', requireRole('admin', 'super_admin'), invoiceController.getInvoices);

/**
 * @swagger
 * /invoices:
 *   post:
 *     summary: Create invoice manually
 *     tags: [Invoices]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       201:
 *         description: Invoice created
 */
router.post(
  '/',
  requireRole('admin', 'super_admin', 'agent'),
  validate(createInvoiceSchema),
  invoiceController.createInvoice,
);

/**
 * @swagger
 * /invoices/{id}/download:
 *   get:
 *     summary: Download invoice PDF
 *     tags: [Invoices]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema: { type: string }
 *     responses:
 *       200:
 *         description: PDF file stream
 */
router.get(
  '/:id/download',
  requireRole('admin', 'super_admin', 'agent'),
  validate(invoiceIdSchema, 'params'),
  invoiceController.downloadInvoice,
);

/**
 * @swagger
 * /invoices/{id}/generate-pdf:
 *   post:
 *     summary: Generate invoice PDF
 *     tags: [Invoices]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema: { type: string }
 *     responses:
 *       200:
 *         description: PDF generated
 */
router.post(
  '/:id/generate-pdf',
  requireRole('admin', 'super_admin', 'agent'),
  validate(invoiceIdSchema, 'params'),
  invoiceController.generateInvoicePdf,
);

/**
 * @swagger
 * /invoices/{id}/status:
 *   patch:
 *     summary: Update invoice status
 *     tags: [Invoices]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema: { type: string }
 *     responses:
 *       200:
 *         description: Invoice status updated
 */
router.patch(
  '/:id/status',
  requireRole('admin', 'super_admin'),
  validate(invoiceIdSchema, 'params'),
  validate(updateInvoiceStatusSchema),
  invoiceController.updateInvoiceStatus,
);

/**
 * @swagger
 * /invoices/{id}:
 *   get:
 *     summary: Get invoice by ID
 *     tags: [Invoices]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema: { type: string }
 *     responses:
 *       200:
 *         description: Invoice details
 */
router.get(
  '/:id',
  requireRole('admin', 'super_admin', 'agent'),
  validate(invoiceIdSchema, 'params'),
  invoiceController.getInvoice,
);

export default router;
