import type { Request, Response, NextFunction } from 'express';
import { readFileSync } from 'fs';
import { join } from 'path';
import { v4 as uuidv4 } from 'uuid';

const APP_VERSION = JSON.parse(
  readFileSync(join(process.cwd(), 'package.json'), 'utf-8'),
).version as string;

/** Cap list ?limit= query param to 100 on all API routes */
export function capListLimit(req: Request, _res: Response, next: NextFunction): void {
  if (req.query.limit !== undefined) {
    const parsed = parseInt(String(req.query.limit), 10);
    if (!Number.isNaN(parsed) && parsed > 100) {
      req.query.limit = '100';
    }
  }
  next();
}

/** Assign correlation ID and API version headers */
export function requestContext(req: Request, res: Response, next: NextFunction): void {
  req.id = uuidv4();
  res.setHeader('X-Request-ID', req.id);
  res.setHeader('X-API-Version', APP_VERSION);
  next();
}
