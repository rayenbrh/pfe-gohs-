import type { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';

import User from '../models/User';
import type { UserRole } from '../types/models';
import { AppError } from '../utils/AppError';
import { catchAsync } from '../utils/catchAsync';

function extractToken(req: Request): string | undefined {
  const authHeader = req.headers.authorization;
  if (authHeader?.startsWith('Bearer ')) {
    return authHeader.split(' ')[1];
  }
  if (req.cookies?.token) {
    return req.cookies.token;
  }
  return undefined;
}

function getJwtSecret(): string {
  const secret = process.env.JWT_SECRET;
  if (!secret) {
    throw new AppError('JWT_SECRET is not configured', 500);
  }
  return secret;
}

export const verifyToken = catchAsync(async (req: Request, _res: Response, next: NextFunction) => {
  const token = extractToken(req);

  if (!token) {
    throw new AppError('Not authenticated', 401, 'NO_TOKEN');
  }

  const decoded = jwt.verify(token, getJwtSecret()) as jwt.JwtPayload & {
    _id: string;
    role?: UserRole;
  };

  const user = await User.findById(decoded._id).select('+isActive');

  if (!user) {
    throw new AppError('User no longer exists', 401, 'USER_NOT_FOUND');
  }

  if (user.isActive === false) {
    throw new AppError('Account deactivated', 403, 'ACCOUNT_DEACTIVATED');
  }

  req.user = {
    _id: user._id.toString(),
    name: user.name,
    email: user.email,
    role: user.role,
  };

  next();
});

export const requireRole =
  (...roles: string[]) =>
  catchAsync(async (req: Request, _res: Response, next: NextFunction) => {
    if (!req.user) {
      throw new AppError('Not authenticated', 401, 'NO_TOKEN');
    }

    if (!roles.includes(req.user.role)) {
      throw new AppError('Insufficient permissions', 403, 'FORBIDDEN');
    }

    next();
  });

/** @deprecated Use verifyToken */
export const protect = verifyToken;

/** @deprecated Use requireRole */
export const restrictTo = (...roles: UserRole[]) => requireRole(...roles);

export const optionalAuth = catchAsync(async (req: Request, _res: Response, next: NextFunction) => {
  const token = extractToken(req);
  if (!token) return next();

  try {
    const decoded = jwt.verify(token, getJwtSecret()) as jwt.JwtPayload & { _id: string };
    const user = await User.findById(decoded._id).select('+isActive');
    if (user?.isActive) {
      req.user = {
        _id: user._id.toString(),
        name: user.name,
        email: user.email,
        role: user.role,
      };
    }
  } catch {
    // optional — ignore invalid token
  }

  next();
});
