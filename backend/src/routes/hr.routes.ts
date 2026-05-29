import { Router } from 'express';

import * as hrController from '../controllers/hr.controller';
import { protect, restrictTo } from '../middleware/auth.middleware';

const router = Router();

router.use(protect, restrictTo('admin', 'super_admin'));

router.get('/', hrController.getStaff);
router.get('/:id', hrController.getStaffMember);
router.patch('/:id', hrController.updateStaffMember);
router.delete('/:id', hrController.deactivateStaffMember);

export default router;
