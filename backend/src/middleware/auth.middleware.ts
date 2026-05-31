import type { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';

import SuperAdmin from '../models/SuperAdmin';
import { getUserModel } from '../models/User';
import { AppError } from '../utils/AppError';
import { catchAsync } from '../utils/catchAsync';

function extractToken(req: Request): string | undefined {
  const authHeader = req.headers.authorization;
  if (authHeader?.startsWith('Bearer ')) return authHeader.split(' ')[1];
  if (req.cookies?.token) return req.cookies.token;
  return undefined;
}

function getJwtSecret(): string {
  const secret = process.env.JWT_SECRET;
  if (!secret) throw new AppError('JWT_SECRET is not configured', 500);
  return secret;
}

/**
 * Verifies the JWT and attaches req.user.
 *
 * - If the token carries role === 'super_admin' → looks up SuperAdmin in master DB.
 * - Otherwise → looks up User in the tenant DB (requires tenantMiddleware first).
 */
export const verifyToken = catchAsync(async (req: Request, _res: Response, next: NextFunction) => {
  const token = extractToken(req);
  if (!token) throw new AppError('Not authenticated', 401, 'NO_TOKEN');

  const decoded = jwt.verify(token, getJwtSecret()) as jwt.JwtPayload & {
    _id: string;
    role?: string;
    agencyId?: string;
    agencySlug?: string;
  };

  if (decoded.role === 'super_admin') {
    const admin = await SuperAdmin.findById(decoded._id).select('+isActive');
    if (!admin) throw new AppError('User no longer exists', 401, 'USER_NOT_FOUND');
    if (!admin.isActive) throw new AppError('Account deactivated', 403, 'ACCOUNT_DEACTIVATED');

    req.user = { _id: admin._id.toString(), name: admin.name, email: admin.email, role: 'super_admin' };
  } else {
    // Agency user — tenantMiddleware must have run first
    if (!req.tenantDb) {
      throw new AppError('Tenant context missing — ensure tenantMiddleware is applied', 500);
    }
    const User = getUserModel(req.tenantDb);
    const user = await User.findById(decoded._id).select('+isActive');
    if (!user) throw new AppError('User no longer exists', 401, 'USER_NOT_FOUND');
    if (!user.isActive) throw new AppError('Account deactivated', 403, 'ACCOUNT_DEACTIVATED');

    req.user = {
      _id: user._id.toString(),
      name: user.name ?? user.firstName,
      email: user.email,
      role: user.role as 'admin' | 'employee' | 'client',
      agencyId: req.agency?._id.toString(),
      agencySlug: req.agency?.slug,
    };
  }

  next();
});

export const requireRole =
  (...roles: string[]) =>
  catchAsync(async (req: Request, _res: Response, next: NextFunction) => {
    if (!req.user) throw new AppError('Not authenticated', 401, 'NO_TOKEN');
    if (!roles.includes(req.user.role)) {
      throw new AppError('Insufficient permissions', 403, 'FORBIDDEN');
    }
    next();
  });

/** @deprecated Use verifyToken */
export const protect = verifyToken;

/** @deprecated Use requireRole */
export const restrictTo = (...roles: string[]) => requireRole(...roles);

export const optionalAuth = catchAsync(async (req: Request, _res: Response, next: NextFunction) => {
  const token = extractToken(req);
  if (!token) return next();

  try {
    const decoded = jwt.verify(token, getJwtSecret()) as jwt.JwtPayload & {
      _id: string;
      role?: string;
    };

    if (decoded.role === 'super_admin') {
      const admin = await SuperAdmin.findById(decoded._id).select('+isActive');
      if (admin?.isActive) {
        req.user = { _id: admin._id.toString(), name: admin.name, email: admin.email, role: 'super_admin' };
      }
    } else if (req.tenantDb) {
      const User = getUserModel(req.tenantDb);
      const user = await User.findById(decoded._id).select('+isActive');
      if (user?.isActive) {
        req.user = {
          _id: user._id.toString(),
          name: user.name ?? user.firstName,
          email: user.email,
          role: user.role as 'admin' | 'employee' | 'client',
          agencyId: req.agency?._id.toString(),
          agencySlug: req.agency?.slug,
        };
      }
    }
  } catch {
    // optional — ignore invalid token
  }

  next();
});
