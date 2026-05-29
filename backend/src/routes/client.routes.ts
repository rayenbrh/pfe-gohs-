import { Router } from 'express';

import * as clientController from '../controllers/client.controller';
import { requireRole, verifyToken } from '../middleware/auth.middleware';
import { validate } from '../middleware/validate.middleware';
import {
  blacklistClientSchema,
  clientIdSchema,
  createClientSchema,
  updateClientSchema,
} from '../validators/client.validator';

const router = Router();

router.use(verifyToken);

/**
 * @swagger
 * /clients:
 *   get:
 *     summary: List clients (paginated)
 *     tags: [Clients]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - $ref: '#/components/parameters/PageParam'
 *       - $ref: '#/components/parameters/LimitParam'
 *     responses:
 *       200:
 *         description: Paginated client list
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ApiSuccess'
 */
router.get('/', requireRole('admin', 'super_admin'), clientController.getClients);

/**
 * @swagger
 * /clients/{id}/history:
 *   get:
 *     summary: Client rental history
 *     tags: [Clients]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema: { type: string }
 *       - $ref: '#/components/parameters/PageParam'
 *       - $ref: '#/components/parameters/LimitParam'
 *     responses:
 *       200:
 *         description: Reservation history for client
 */
router.get(
  '/:id/history',
  requireRole('admin', 'super_admin'),
  validate(clientIdSchema, 'params'),
  clientController.getClientHistory,
);

/**
 * @swagger
 * /clients/{id}:
 *   get:
 *     summary: Get client by ID
 *     tags: [Clients]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema: { type: string }
 *     responses:
 *       200:
 *         description: Client details
 *         content:
 *           application/json:
 *             schema:
 *               allOf:
 *                 - $ref: '#/components/schemas/ApiSuccess'
 *                 - type: object
 *                   properties:
 *                     data:
 *                       $ref: '#/components/schemas/Client'
 */
router.get(
  '/:id',
  requireRole('admin', 'super_admin'),
  validate(clientIdSchema, 'params'),
  clientController.getClient,
);

/**
 * @swagger
 * /clients:
 *   post:
 *     summary: Create a client
 *     tags: [Clients]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/Client'
 *     responses:
 *       201:
 *         description: Client created
 */
router.post(
  '/',
  requireRole('admin', 'super_admin', 'agent'),
  validate(createClientSchema),
  clientController.createClient,
);

/**
 * @swagger
 * /clients/{id}/blacklist:
 *   patch:
 *     summary: Blacklist or unblacklist a client
 *     tags: [Clients]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema: { type: string }
 *     responses:
 *       200:
 *         description: Client blacklist status updated
 */
router.patch(
  '/:id/blacklist',
  requireRole('admin', 'super_admin'),
  validate(clientIdSchema, 'params'),
  validate(blacklistClientSchema),
  clientController.blacklistClient,
);

/**
 * @swagger
 * /clients/{id}:
 *   patch:
 *     summary: Update client
 *     tags: [Clients]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema: { type: string }
 *     responses:
 *       200:
 *         description: Client updated
 */
router.patch(
  '/:id',
  requireRole('admin', 'super_admin', 'agent'),
  validate(clientIdSchema, 'params'),
  validate(updateClientSchema),
  clientController.updateClient,
);

/**
 * @swagger
 * /clients/{id}:
 *   delete:
 *     summary: Soft-delete client (super_admin)
 *     tags: [Clients]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema: { type: string }
 *     responses:
 *       200:
 *         description: Client deactivated
 */
router.delete(
  '/:id',
  requireRole('super_admin'),
  validate(clientIdSchema, 'params'),
  clientController.deleteClient,
);

export default router;
