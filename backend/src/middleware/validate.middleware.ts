import type { Request, Response, NextFunction } from 'express';
import type { ZodSchema } from 'zod';

import { AppError, type ValidationErrorItem } from '../utils/AppError';

type ValidationTarget = 'body' | 'query' | 'params';

const stripHtml = (str: string): string => str.replace(/<[^>]*>/g, '').trim();

function sanitizeStrings<T>(value: T): T {
  if (typeof value === 'string') {
    return stripHtml(value) as T;
  }
  if (Array.isArray(value)) {
    return value.map((item) => sanitizeStrings(item)) as T;
  }
  if (value !== null && typeof value === 'object') {
    const out: Record<string, unknown> = {};
    for (const [key, val] of Object.entries(value)) {
      out[key] = sanitizeStrings(val);
    }
    return out as T;
  }
  return value;
}

export const validate =
  (schema: ZodSchema, target: ValidationTarget = 'body') =>
  (req: Request, _res: Response, next: NextFunction) => {
    const result = schema.safeParse(req[target]);

    if (!result.success) {
      const errors: ValidationErrorItem[] = result.error.errors.map((err) => ({
        field: err.path.join('.') || 'root',
        message: err.message,
      }));
      return next(new AppError(errors, 400, 'VALIDATION_ERROR'));
    }

    req[target] = sanitizeStrings(result.data);
    next();
  };
