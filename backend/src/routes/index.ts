import { Router } from 'express';

import adminRoutes from './admin.routes';
import authRoutes from './auth.routes';
import clientRoutes from './client.routes';
import contractRoutes from './contract.routes';
import invoiceRoutes from './invoice.routes';
import maintenanceRoutes from './maintenance.routes';
import paymentRoutes from './payment.routes';
import reservationRoutes from './reservation.routes';
import uploadRoutes from './upload.routes';
import userRoutes from './user.routes';
import vehicleRoutes from './vehicle.routes';

const router = Router();

router.use('/auth', authRoutes);
router.use('/vehicles', vehicleRoutes);
router.use('/reservations', reservationRoutes);
router.use('/clients', clientRoutes);
router.use('/contracts', contractRoutes);
router.use('/invoices', invoiceRoutes);
router.use('/users', userRoutes);
router.use('/hr', userRoutes);
router.use('/maintenance', maintenanceRoutes);
router.use('/payments', paymentRoutes);
router.use('/upload', uploadRoutes);
router.use('/uploads', uploadRoutes);
router.use('/admin', adminRoutes);

export default router;
