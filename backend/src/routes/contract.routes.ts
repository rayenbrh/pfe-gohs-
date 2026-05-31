import { Router } from 'express';

import * as contractController from '../controllers/contract.controller';
import { requireRole, verifyToken } from '../middleware/auth.middleware';
import { validate } from '../middleware/validate.middleware';
import { contractIdSchema, reservationIdParamSchema } from '../validators/contract.validator';

const router = Router();

router.use(verifyToken);

/**
 * @swagger
 * /contracts/generate/{reservationId}:
 *   post:
 *     summary: Generate rental contract PDF for a reservation
 *     tags: [Contracts]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: reservationId
 *         required: true
 *         schema: { type: string }
 *     responses:
 *       201:
 *         description: Contract generated
 */
router.post(
  '/generate/:reservationId',
  requireRole('admin', 'admin', 'employee'),
  validate(reservationIdParamSchema, 'params'),
  contractController.generateContract,
);

/**
 * @swagger
 * /contracts/reservation/{reservationId}:
 *   get:
 *     summary: Get contract by reservation ID
 *     tags: [Contracts]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: reservationId
 *         required: true
 *         schema: { type: string }
 *     responses:
 *       200:
 *         description: Contract for reservation
 */
router.get(
  '/reservation/:reservationId',
  requireRole('admin', 'admin', 'employee'),
  validate(reservationIdParamSchema, 'params'),
  contractController.getContractByReservation,
);

/**
 * @swagger
 * /contracts:
 *   get:
 *     summary: List contracts (paginated)
 *     tags: [Contracts]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - $ref: '#/components/parameters/PageParam'
 *       - $ref: '#/components/parameters/LimitParam'
 *     responses:
 *       200:
 *         description: Paginated contracts
 */
router.get('/', requireRole('admin', 'admin'), contractController.getContracts);

/**
 * @swagger
 * /contracts/{id}:
 *   get:
 *     summary: Get contract by ID
 *     tags: [Contracts]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema: { type: string }
 *     responses:
 *       200:
 *         description: Contract details
 */
router.get(
  '/:id',
  requireRole('admin', 'admin'),
  validate(contractIdSchema, 'params'),
  contractController.getContract,
);

export default router;

