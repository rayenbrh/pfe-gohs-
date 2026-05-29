import { Router } from 'express';

import * as userController from '../controllers/user.controller';
import { requireRole, verifyToken } from '../middleware/auth.middleware';
import { validate } from '../middleware/validate.middleware';
import { updateUserSchema, userIdSchema } from '../validators/user.validator';

const router = Router();

router.use(verifyToken, requireRole('admin', 'super_admin'));

/**
 * @swagger
 * /users:
 *   get:
 *     summary: List staff users
 *     tags: [Users]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - $ref: '#/components/parameters/PageParam'
 *       - $ref: '#/components/parameters/LimitParam'
 *     responses:
 *       200:
 *         description: Paginated users
 */
router.get('/', userController.getUsers);

/**
 * @swagger
 * /users/{id}:
 *   get:
 *     summary: Get user by ID
 *     tags: [Users]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema: { type: string }
 *     responses:
 *       200:
 *         description: User profile
 */
router.get('/:id', validate(userIdSchema, 'params'), userController.getUser);

/**
 * @swagger
 * /users/{id}:
 *   patch:
 *     summary: Update user (super_admin)
 *     tags: [Users]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema: { type: string }
 *     responses:
 *       200:
 *         description: User updated
 */
router.patch(
  '/:id',
  requireRole('super_admin'),
  validate(userIdSchema, 'params'),
  validate(updateUserSchema),
  userController.updateUser,
);

/**
 * @swagger
 * /users/{id}:
 *   delete:
 *     summary: Deactivate user (super_admin)
 *     tags: [Users]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema: { type: string }
 *     responses:
 *       200:
 *         description: User deactivated
 */
router.delete(
  '/:id',
  requireRole('super_admin'),
  validate(userIdSchema, 'params'),
  userController.deleteUser,
);

export default router;
