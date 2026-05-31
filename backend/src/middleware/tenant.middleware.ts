import type { NextFunction, Request, Response } from 'express';

import { getAgencyConnection, runWithTenant } from '../config/tenantDB';
import Agency from '../models/Agency';
import { AppError } from '../utils/AppError';

/**
 * Resolves the agency from :agencySlug URL param, opens (or reuses) its DB
 * connection, attaches req.agency + req.tenantDb, then runs the rest of the
 * middleware chain inside the AsyncLocalStorage tenant context.
 */
export function tenantMiddleware(req: Request, res: Response, next: NextFunction): void {
  const slug = req.params.agencySlug;
  if (!slug) {
    next(new AppError('Agency slug is required', 400, 'MISSING_SLUG'));
    return;
  }

  Agency.findOne({ slug, isActive: true })
    .then(async (agency) => {
      if (!agency) {
        throw new AppError('Agency not found', 404, 'AGENCY_NOT_FOUND');
      }
      const conn = await getAgencyConnection(agency.dbName);
      req.agency = agency;
      req.tenantDb = conn;
      // Run the rest of the chain inside the tenant context
      runWithTenant(conn, () => next());
    })
    .catch(next);
}
