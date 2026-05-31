import { Router } from 'express';

import * as ctrl from '../controllers/superadmin.controller';
import { verifyToken, requireRole } from '../middleware/auth.middleware';

const router = Router();

// Public
router.post('/auth/login', ctrl.login);

// Protected â€” super_admin only
router.use(verifyToken, requireRole('super_admin'));

router.get('/auth/me', ctrl.me);

// Agencies
router.get('/agencies', ctrl.listAgencies);
router.post('/agencies', ctrl.createAgency);
router.get('/agencies/:id', ctrl.getAgency);
router.patch('/agencies/:id', ctrl.updateAgency);
router.delete('/agencies/:id', ctrl.deleteAgency);

// Global stats
router.get('/stats', ctrl.getGlobalStats);

// Super admin accounts
router.get('/accounts', ctrl.listAccounts);
router.post('/accounts', ctrl.createAccount);
router.patch('/accounts/:id', ctrl.toggleAccountStatus);

export default router;

