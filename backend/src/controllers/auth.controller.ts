import type { Request, Response } from 'express';

import logger from '../config/logger';
import User from '../models/User';
import { AppError } from '../utils/AppError';
import { paginateQuery } from '../utils/apiFeatures';
import { catchAsync } from '../utils/catchAsync';
import {
  generateAccessToken,
  generateRefreshToken,
  verifyRefreshToken,
} from '../utils/generateToken';

function formatUser(user: { _id: { toString(): string } | string; name: string; email: string; role: string }) {
  const id = typeof user._id === 'string' ? user._id : user._id.toString();
  return { id, name: user.name, email: user.email, role: user.role };
}

export const register = catchAsync(async (req: Request, res: Response) => {
  const existing = await User.findOne({ email: req.body.email });
  if (existing) {
    throw new AppError('Email already in use', 409, 'EMAIL_EXISTS');
  }

  const user = await User.create(req.body);

  res.status(201).json({
    status: 'success',
    data: { user: formatUser(user) },
  });
});

export const login = catchAsync(async (req: Request, res: Response) => {
  const { email, password } = req.body;

  const user = await User.findByEmail(email);

  if (!user || !(await user.comparePassword(password))) {
    throw new AppError('Invalid credentials', 401, 'INVALID_CREDENTIALS');
  }

  if (user.isActive === false) {
    throw new AppError('Account deactivated', 403, 'ACCOUNT_DEACTIVATED');
  }

  user.lastLogin = new Date();
  await user.save({ validateBeforeSave: false });

  const accessToken = generateAccessToken({ _id: user._id.toString(), role: user.role });
  const refreshToken = generateRefreshToken({ _id: user._id.toString() });

  logger.info('User logged in', {
    userId: user._id.toString(),
    email: user.email,
    ip: req.ip,
  });

  res.status(200).json({
    status: 'success',
    data: {
      user: formatUser(user),
      accessToken,
      refreshToken,
    },
  });
});

export const me = catchAsync(async (req: Request, res: Response) => {
  res.status(200).json({
    status: 'success',
    data: { user: formatUser(req.user!) },
  });
});

export const refresh = catchAsync(async (req: Request, res: Response) => {
  const { refreshToken } = req.body;
  const decoded = verifyRefreshToken(refreshToken);

  const user = await User.findById(decoded._id);
  if (!user || user.isActive === false) {
    throw new AppError('User no longer exists', 401, 'USER_NOT_FOUND');
  }

  const accessToken = generateAccessToken({ _id: user._id.toString(), role: user.role });

  res.status(200).json({
    status: 'success',
    data: { accessToken },
  });
});

export const logout = catchAsync(async (_req: Request, res: Response) => {
  res.status(200).json({
    status: 'success',
    message: 'Logged out successfully',
  });
});

export const changePassword = catchAsync(async (req: Request, res: Response) => {
  const user = await User.findById(req.user!._id).select('+password');
  if (!user) {
    throw new AppError('User no longer exists', 401, 'USER_NOT_FOUND');
  }

  const { currentPassword, newPassword } = req.body;

  if (!(await user.comparePassword(currentPassword))) {
    throw new AppError('Current password is incorrect', 401, 'INVALID_PASSWORD');
  }

  user.password = newPassword;
  await user.save();

  res.status(200).json({
    status: 'success',
    message: 'Password changed successfully',
  });
});

export const listUsers = catchAsync(async (req: Request, res: Response) => {
  const page = parseInt(String(req.query.page ?? '1'), 10);
  const limit = Math.min(parseInt(String(req.query.limit ?? '20'), 10), 100);

  const query = User.find()
    .select('-password -refreshToken -passwordChangedAt')
    .sort('-createdAt');

  const result = await paginateQuery(query, page, limit);

  res.status(200).json({
    status: 'success',
    results: result.data.length,
    data: {
      users: result.data,
    },
    meta: {
      page: result.page,
      limit: result.limit,
      total: result.total,
      totalPages: result.totalPages,
    },
  });
});

export const deactivateUser = catchAsync(async (req: Request, res: Response) => {
  if (req.params.id === req.user!._id) {
    throw new AppError('You cannot deactivate your own account', 400, 'SELF_DEACTIVATE');
  }

  const user = await User.findByIdAndUpdate(
    req.params.id,
    { isActive: false },
    { new: true, runValidators: true },
  ).select('-password -refreshToken -passwordChangedAt');

  if (!user) {
    throw new AppError('User not found', 404, 'USER_NOT_FOUND');
  }

  res.status(200).json({
    status: 'success',
    data: { user },
  });
});
