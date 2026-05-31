/**
 * All routes under /api/agency/:agencySlug/* are handled here.
 * tenantMiddleware is applied first to resolve the agency DB connection.
 */
import { Router } from 'express';

import * as agencyAuth from '../controllers/agencyAuth.controller';
import adminRoutes from './admin.routes';
import clientRoutes from './client.routes';
import contractRoutes from './contract.routes';
import invoiceRoutes from './invoice.routes';
import maintenanceRoutes from './maintenance.routes';
import paymentRoutes from './payment.routes';
import reservationRoutes from './reservation.routes';
import uploadRoutes from './upload.routes';
import vehicleRoutes from './vehicle.routes';
import hrRoutes from './hr.routes';
import { verifyToken, requireRole } from '../middleware/auth.middleware';
import { tenantMiddleware } from '../middleware/tenant.middleware';
import { authLimiter } from '../middleware/rateLimiter.middleware';

const router = Router({ mergeParams: true });

// Apply tenant resolution to every request under this router
router.use(tenantMiddleware);

// ── Auth (agency-scoped) ─────────────────────────────────────────────────────
router.post('/auth/register', authLimiter, agencyAuth.register);
router.post('/auth/login', authLimiter, agencyAuth.login);
router.get('/auth/me', verifyToken, agencyAuth.me);
router.post('/auth/refresh', authLimiter, agencyAuth.refresh);
router.post('/auth/logout', verifyToken, agencyAuth.logout);
router.patch('/auth/change-password', verifyToken, agencyAuth.changePassword);

// ── Protected resource routes ────────────────────────────────────────────────
router.use('/vehicles', vehicleRoutes);
router.use('/reservations', reservationRoutes);
router.use('/clients', clientRoutes);
router.use('/contracts', contractRoutes);
router.use('/invoices', invoiceRoutes);
router.use('/maintenance', maintenanceRoutes);
router.use('/payments', paymentRoutes);
router.use('/upload', uploadRoutes);
router.use('/uploads', uploadRoutes);
router.use('/admin', adminRoutes);
router.use('/hr', hrRoutes);

// ── Employee management (admin only) ─────────────────────────────────────────
import { getUserModel } from '../models/User';
import { catchAsync } from '../utils/catchAsync';
import { AppError } from '../utils/AppError';
import type { Request, Response } from 'express';
import { generateAccessToken } from '../utils/generateToken';

router.get(
  '/employees',
  verifyToken,
  requireRole('admin'),
  catchAsync(async (req: Request, res: Response) => {
    const User = getUserModel(req.tenantDb!);
    const employees = await User.find({ role: 'employee', isActive: { $ne: false } })
      .select('-password -refreshToken -passwordChangedAt')
      .sort('-createdAt');
    res.json({ status: 'success', results: employees.length, data: { employees } });
  }),
);

router.post(
  '/employees',
  verifyToken,
  requireRole('admin'),
  catchAsync(async (req: Request, res: Response) => {
    const User = getUserModel(req.tenantDb!);
    const existing = await User.findOne({ email: req.body.email });
    if (existing) throw new AppError('Email already in use', 409, 'EMAIL_EXISTS');
    const employee = await User.create({ ...req.body, role: 'employee' });
    res.status(201).json({
      status: 'success',
      data: { employee: { id: employee._id, name: employee.name, email: employee.email, role: 'employee' } },
    });
  }),
);

router.patch(
  '/employees/:id',
  verifyToken,
  requireRole('admin'),
  catchAsync(async (req: Request, res: Response) => {
    const User = getUserModel(req.tenantDb!);
    const employee = await User.findOneAndUpdate(
      { _id: req.params.id, role: 'employee' },
      req.body,
      { new: true, runValidators: true },
    ).select('-password -refreshToken');
    if (!employee) throw new AppError('Employee not found', 404, 'NOT_FOUND');
    res.json({ status: 'success', data: { employee } });
  }),
);

router.delete(
  '/employees/:id',
  verifyToken,
  requireRole('admin'),
  catchAsync(async (req: Request, res: Response) => {
    const User = getUserModel(req.tenantDb!);
    const employee = await User.findOneAndUpdate(
      { _id: req.params.id, role: 'employee' },
      { isActive: false },
      { new: true },
    );
    if (!employee) throw new AppError('Employee not found', 404, 'NOT_FOUND');
    res.json({ status: 'success', data: { employee } });
  }),
);

export default router;
