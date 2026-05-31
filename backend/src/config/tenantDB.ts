import { AsyncLocalStorage } from 'async_hooks';
import mongoose from 'mongoose';

import logger from './logger';

// ─── Async-local storage: holds the current request's tenant connection ───────
const tenantStorage = new AsyncLocalStorage<mongoose.Connection>();

export function getTenantConnection(): mongoose.Connection {
  const conn = tenantStorage.getStore();
  if (!conn) throw new Error('No tenant DB context — ensure tenantMiddleware is applied');
  return conn;
}

export function runWithTenant<T>(conn: mongoose.Connection, fn: () => T): T {
  return tenantStorage.run(conn, fn);
}

// ─── Connection pool: one connection per agency DB name ──────────────────────
const pool = new Map<string, mongoose.Connection>();

function buildAgencyUri(dbName: string): string {
  const base = process.env.MASTER_MONGODB_URI ?? process.env.MONGODB_URI ?? '';
  // Replace the database name portion in the URI
  return base.replace(/\/[^/?]+(\?|$)/, `/${dbName}$1`);
}

export async function getAgencyConnection(dbName: string): Promise<mongoose.Connection> {
  const existing = pool.get(dbName);
  if (existing && existing.readyState === 1) return existing;

  const uri = buildAgencyUri(dbName);
  const conn = mongoose.createConnection(uri, { maxPoolSize: 5 });
  await conn.asPromise();

  conn.on('error', (err) => logger.error(`Agency DB [${dbName}] error`, { err }));
  conn.on('disconnected', () => {
    logger.warn(`Agency DB [${dbName}] disconnected — removing from pool`);
    pool.delete(dbName);
  });

  pool.set(dbName, conn);
  logger.info(`Agency DB [${dbName}] connected`);
  return conn;
}

export async function closeAllAgencyConnections(): Promise<void> {
  await Promise.all([...pool.values()].map((c) => c.close()));
  pool.clear();
}
