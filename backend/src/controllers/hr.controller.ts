import type { Request, Response } from 'express';

import User from '../models/User';
import { AppError } from '../utils/AppError';
import { paginateQuery } from '../utils/apiFeatures';
import { catchAsync } from '../utils/catchAsync';

export const getStaff = catchAsync(async (req: Request, res: Response) => {
  const page = parseInt(String(req.query.page ?? '1'), 10);
  const limit = Math.min(parseInt(String(req.query.limit ?? '20'), 10), 100);
  const query = User.find({ role: { $in: ['agent', 'admin', 'super_admin'] } }).select('-password -refreshToken').sort('name');
  const result = await paginateQuery(query, page, limit);
  res.json({ success: true, data: result.data, meta: { page: result.page, limit: result.limit, total: result.total, totalPages: result.totalPages } });
});

export const getStaffMember = catchAsync(async (req: Request, res: Response) => {
  const user = await User.findById(req.params.id).select('-password -refreshToken');
  if (!user) throw new AppError('Staff member not found', 404);
  res.json({ success: true, data: user });
});

export const updateStaffMember = catchAsync(async (req: Request, res: Response) => {
  const allowed = ['name', 'role', 'isActive', 'avatar'];
  const updates = Object.fromEntries(
    Object.entries(req.body).filter(([key]) => allowed.includes(key)),
  );

  const user = await User.findByIdAndUpdate(req.params.id, updates, { new: true, runValidators: true }).select('-password -refreshToken');
  if (!user) throw new AppError('Staff member not found', 404);
  res.json({ success: true, data: user });
});

export const deactivateStaffMember = catchAsync(async (req: Request, res: Response) => {
  const user = await User.findByIdAndUpdate(req.params.id, { isActive: false }, { new: true }).select('-password -refreshToken');
  if (!user) throw new AppError('Staff member not found', 404);
  res.json({ success: true, data: user });
});
