import type mongoose from 'mongoose';
import type { IAgencyDocument } from '../models/Agency';

declare global {
  namespace Express {
    interface Request {
      id?: string;
      user?: {
        _id: string;
        name?: string;
        email: string;
        role: 'super_admin' | 'admin' | 'employee' | 'client';
        agencyId?: string;
        agencySlug?: string;
      };
      /** Tenant DB connection — set by tenantMiddleware */
      tenantDb?: mongoose.Connection;
      /** Agency document — set by tenantMiddleware */
      agency?: IAgencyDocument;
      cookies?: {
        token?: string;
      };
    }
  }
}

export {};
