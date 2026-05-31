/**
 * Clients are now Users with role === 'client' in the agency database.
 * This module provides a tenant-aware getClientModel() that returns the User
 * model scoped to the current tenant connection.
 *
 * All services that previously imported Client should use getClientModel().
 * Queries must add { role: 'client' } to filters.
 */
import mongoose from 'mongoose';

import { getTenantConnection } from '../config/tenantDB';
import type { IUserDocument, IUserModel } from '../types/models';
import { userSchema } from './User';

export function getClientModel(conn?: mongoose.Connection): IUserModel {
  const c = conn ?? getTenantConnection();
  if (c.models.User) return c.models.User as IUserModel;
  return c.model<IUserDocument, IUserModel>('User', userSchema);
}

// Legacy default export — kept for backward compat, points to default connection
const Client = mongoose.model<IUserDocument, IUserModel>('ClientLegacy', userSchema);
export default Client;
