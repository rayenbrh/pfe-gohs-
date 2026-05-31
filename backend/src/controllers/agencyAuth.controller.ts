import type { Request, Response } from 'express';

import logger from '../config/logger';
import { getUserModel } from '../models/User';
import { AppError } from '../utils/AppError';
import { catchAsync } from '../utils/catchAsync';
import { generateAccessToken, generateRefreshToken, verifyRefreshToken } from '../utils/generateToken';

function formatUser(user: { _id: { toString(): string } | string; name?: string; firstName?: string; lastName?: string; email: string; role: string }) {
  const id = typeof user._id === 'string' ? user._id : user._id.toString();
  const name = user.name ?? (user.firstName ? `${user.firstName} ${user.lastName ?? ''}`.trim() : '');
  return { id, name, email: user.email, role: user.role };
}

/** Client self-registration */
export const register = catchAsync(async (req: Request, res: Response) => {
  const User = getUserModel(req.tenantDb!);

  const existing = await User.findOne({ email: req.body.email });
  if (existing) throw new AppError('Email already in use', 409, 'EMAIL_EXISTS');

  const user = await User.create({
    ...req.body,
    role: 'client', // always client on self-registration
  });

  const accessToken = generateAccessToken({
    _id: user._id.toString(),
    role: 'client',
    agencyId: req.agency!._id.toString(),
    agencySlug: req.agency!.slug,
  } as Parameters<typeof generateAccessToken>[0]);
  const refreshToken = generateRefreshToken({ _id: user._id.toString() });

  res.status(201).json({
    status: 'success',
    data: {
      user: formatUser(user),
      accessToken,
      refreshToken,
      agency: { name: req.agency!.name, slug: req.agency!.slug },
    },
  });
});

/** Login for admin, employee, and client */
export const login = catchAsync(async (req: Request, res: Response) => {
  const { email, password } = req.body as { email: string; password: string };
  const User = getUserModel(req.tenantDb!);

  const user = await User.findByEmail(email);

  if (!user || !(await user.comparePassword(password))) {
    throw new AppError('Invalid credentials', 401, 'INVALID_CREDENTIALS');
  }
  if (!user.isActive) {
    throw new AppError('Account deactivated', 403, 'ACCOUNT_DEACTIVATED');
  }

  user.lastLogin = new Date();
  await user.save({ validateBeforeSave: false });

  const accessToken = generateAccessToken({
    _id: user._id.toString(),
    role: user.role,
    agencyId: req.agency!._id.toString(),
    agencySlug: req.agency!.slug,
  } as Parameters<typeof generateAccessToken>[0]);
  const refreshToken = generateRefreshToken({ _id: user._id.toString() });

  logger.info('Agency user logged in', {
    userId: user._id.toString(),
    email: user.email,
    role: user.role,
    agencySlug: req.agency!.slug,
    ip: req.ip,
  });

  res.status(200).json({
    status: 'success',
    data: {
      user: formatUser(user),
      accessToken,
      refreshToken,
      agency: { name: req.agency!.name, slug: req.agency!.slug },
    },
  });
});

export const me = catchAsync(async (req: Request, res: Response) => {
  res.status(200).json({
    status: 'success',
    data: {
      user: req.user,
      agency: req.agency ? { name: req.agency.name, slug: req.agency.slug, logo: req.agency.logo } : null,
    },
  });
});

export const refresh = catchAsync(async (req: Request, res: Response) => {
  const { refreshToken } = req.body;
  const decoded = verifyRefreshToken(refreshToken);
  const User = getUserModel(req.tenantDb!);

  const user = await User.findById(decoded._id);
  if (!user || !user.isActive) {
    throw new AppError('User no longer exists', 401, 'USER_NOT_FOUND');
  }

  const accessToken = generateAccessToken({
    _id: user._id.toString(),
    role: user.role,
    agencyId: req.agency!._id.toString(),
    agencySlug: req.agency!.slug,
  } as Parameters<typeof generateAccessToken>[0]);

  res.status(200).json({ status: 'success', data: { accessToken } });
});

export const logout = catchAsync(async (_req: Request, res: Response) => {
  res.status(200).json({ status: 'success', message: 'Logged out successfully' });
});

export const changePassword = catchAsync(async (req: Request, res: Response) => {
  const User = getUserModel(req.tenantDb!);
  const user = await User.findById(req.user!._id).select('+password');
  if (!user) throw new AppError('User not found', 404, 'USER_NOT_FOUND');

  const { currentPassword, newPassword } = req.body;
  if (!(await user.comparePassword(currentPassword))) {
    throw new AppError('Current password is incorrect', 401, 'INVALID_PASSWORD');
  }

  user.password = newPassword;
  await user.save();

  res.status(200).json({ status: 'success', message: 'Password changed successfully' });
});
