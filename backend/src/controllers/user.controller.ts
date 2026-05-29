import type { Request, Response } from 'express';

import User from '../models/User';
import { AppError } from '../utils/AppError';
import { APIFeatures } from '../utils/apiFeatures';
import { catchAsync } from '../utils/catchAsync';

export const getUsers = catchAsync(async (req: Request, res: Response) => {
  const filter: Record<string, unknown> = {
    role: { $in: ['super_admin', 'admin', 'agent'] },
  };
  if (req.query.role) filter.role = req.query.role;
  if (req.query.isActive !== undefined) filter.isActive = req.query.isActive === 'true';

  const features = new APIFeatures(
    User.find(filter).select('-password -refreshToken -passwordChangedAt').sort('name'),
    req.query as Record<string, string | undefined>,
  )
    .sort()
    .paginate();

  const users = await features.query;
  const total = await features.paginationResult!.totalCountPromise;
  const limit = features.paginationResult!.limit;
  const skip = features.paginationResult!.skip;

  res.status(200).json({
    status: 'success',
    results: users.length,
    totalPages: Math.ceil(total / limit) || 1,
    currentPage: Math.floor(skip / limit) + 1,
    data: { users },
  });
});

export const getUser = catchAsync(async (req: Request, res: Response) => {
  const user = await User.findById(req.params.id).select(
    '-password -refreshToken -passwordChangedAt',
  );
  if (!user) throw new AppError('User not found', 404, 'USER_NOT_FOUND');

  res.status(200).json({
    status: 'success',
    data: { user },
  });
});

export const updateUser = catchAsync(async (req: Request, res: Response) => {
  const allowed = ['name', 'role', 'avatar', 'isActive'];
  const updates = Object.fromEntries(
    Object.entries(req.body).filter(([key]) => allowed.includes(key)),
  );

  const user = await User.findByIdAndUpdate(req.params.id, updates, {
    new: true,
    runValidators: true,
  }).select('-password -refreshToken -passwordChangedAt');

  if (!user) throw new AppError('User not found', 404, 'USER_NOT_FOUND');

  res.status(200).json({
    status: 'success',
    data: { user },
  });
});

export const deleteUser = catchAsync(async (req: Request, res: Response) => {
  if (req.params.id === req.user!._id) {
    throw new AppError('You cannot delete your own account', 400, 'SELF_DELETE');
  }

  const user = await User.findByIdAndUpdate(
    req.params.id,
    { isActive: false },
    { new: true },
  ).select('-password -refreshToken -passwordChangedAt');

  if (!user) throw new AppError('User not found', 404, 'USER_NOT_FOUND');

  res.status(200).json({
    status: 'success',
    data: { user },
    message: 'User deactivated successfully',
  });
});
