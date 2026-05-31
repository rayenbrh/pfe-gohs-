import { Router } from 'express';

import agencyRoutes from './agency.routes';
import superadminRoutes from './superadmin.routes';

const router = Router();

// Super admin — no tenant context
router.use('/superadmin', superadminRoutes);

// All agency-scoped routes — resolved via :agencySlug
router.use('/agency/:agencySlug', agencyRoutes);

export default router;
