/**
 * Auth checkpoint tests — run: npm run test:auth
 * Requires MongoDB at MONGODB_URI from .env
 */
import 'express-async-errors';

import express from 'express';
import jwt from 'jsonwebtoken';
import dotenv from 'dotenv';

import { connectDB, disconnectDB } from '../config/db';
import User from '../models/User';
import { errorHandler } from '../middleware/error.middleware';
import authRoutes from '../routes/auth.routes';

dotenv.config();

const TEST_PORT = 5099;
const BASE = `http://127.0.0.1:${TEST_PORT}/api/auth`;

const PASSWORD = 'TestPass1';
const ts = Date.now();

async function request(
  method: string,
  path: string,
  body?: Record<string, unknown>,
  token?: string,
): Promise<{ status: number; body: Record<string, unknown> }> {
  const headers: Record<string, string> = { 'Content-Type': 'application/json' };
  if (token) headers.Authorization = `Bearer ${token}`;

  const res = await fetch(`${BASE}${path}`, {
    method,
    headers,
    body: body ? JSON.stringify(body) : undefined,
  });

  const json = (await res.json().catch(() => ({}))) as Record<string, unknown>;
  return { status: res.status, body: json };
}

function assert(condition: boolean, message: string): void {
  if (!condition) throw new Error(`FAIL: ${message}`);
}

async function main(): Promise<void> {
  await connectDB();

  const superEmail = `super.${ts}@test.inova`;
  const agentEmail = `agent.${ts}@test.inova`;
  const dupEmail = `dup.${ts}@test.inova`;

  await User.deleteMany({ email: { $in: [superEmail, agentEmail, dupEmail] } });

  await User.create({
    name: 'Super Admin Test',
    email: superEmail,
    password: PASSWORD,
    role: 'super_admin',
  });

  await User.create({
    name: 'Agent Test',
    email: agentEmail,
    password: PASSWORD,
    role: 'agent',
  });

  await User.create({
    name: 'Dup User',
    email: dupEmail,
    password: PASSWORD,
    role: 'agent',
  });

  const app = express();
  app.use(express.json());
  app.use('/api/auth', authRoutes);
  app.use(errorHandler);

  const server = app.listen(TEST_PORT);

  try {
    // 1. Login returns accessToken + refreshToken
    const loginRes = await request('POST', '/login', {
      email: superEmail,
      password: PASSWORD,
    });
    assert(loginRes.status === 200, `login status ${loginRes.status}`);
    const loginData = loginRes.body.data as Record<string, unknown>;
    assert(typeof loginData.accessToken === 'string', 'accessToken missing');
    assert(typeof loginData.refreshToken === 'string', 'refreshToken missing');
    const accessToken = loginData.accessToken as string;
    console.log('✓ POST /login returns accessToken + refreshToken');

    // 2. GET /me with valid token
    const meRes = await request('GET', '/me', undefined, accessToken);
    assert(meRes.status === 200, `me status ${meRes.status}`);
    const meUser = (meRes.body.data as Record<string, unknown>).user as Record<string, unknown>;
    assert(meUser.email === superEmail, 'me email mismatch');
    console.log('✓ GET /me with valid Bearer token');

    // 3. GET /me with invalid token
    const invalidRes = await request('GET', '/me', undefined, 'not.a.valid.jwt');
    assert(invalidRes.status === 401, `invalid token status ${invalidRes.status}`);
    assert(typeof invalidRes.body.message === 'string', 'invalid token message missing');
    console.log('✓ GET /me with invalid token returns 401');

    // 4. GET /me with expired token
    const expiredToken = jwt.sign(
      { _id: '000000000000000000000001', role: 'admin' },
      process.env.JWT_SECRET!,
      { expiresIn: '-1s' },
    );
    const expiredRes = await request('GET', '/me', undefined, expiredToken);
    assert(expiredRes.status === 401, `expired status ${expiredRes.status}`);
    assert(
      expiredRes.body.message === 'Your token has expired',
      `expired message: ${expiredRes.body.message}`,
    );
    console.log('✓ GET /me with expired token returns 401 "Your token has expired"');

    // Agent login for forbidden test (before rate-limit exhaustion)
    const agentLogin = await request('POST', '/login', { email: agentEmail, password: PASSWORD });
    const agentToken = (agentLogin.body.data as Record<string, unknown>).accessToken as string;

    // 6. Agent on super_admin route → 403
    const forbiddenRes = await request(
      'POST',
      '/register',
      { name: 'X', email: `new.${ts}@test.inova`, password: PASSWORD },
      agentToken,
    );
    assert(forbiddenRes.status === 403, `forbidden status ${forbiddenRes.status}`);
    assert(
      forbiddenRes.body.message === 'Insufficient permissions',
      `forbidden message: ${forbiddenRes.body.message}`,
    );
    console.log('✓ agent token on super_admin route returns 403');

    // 7. Register duplicate email → 409
    const dupRes = await request(
      'POST',
      '/register',
      { name: 'Dup', email: dupEmail, password: PASSWORD, role: 'agent' },
      accessToken,
    );
    assert(dupRes.status === 409, `dup status ${dupRes.status}`);
    assert(
      dupRes.body.message === 'Email already in use',
      `dup message: ${dupRes.body.message}`,
    );
    console.log('✓ Register with existing email returns 409');

    // 5. Rate limit — 11 login attempts (run last to avoid blocking other tests)
    let got429 = false;
    for (let i = 0; i < 11; i++) {
      const r = await request('POST', '/login', { email: 'x@y.com', password: 'wrong' });
      if (r.status === 429) got429 = true;
    }
    assert(got429, '11 login attempts should eventually return 429');
    console.log('✓ 11th login attempt returns 429');

    console.log('\nAll auth checkpoint tests passed.');
  } finally {
    server.close();
    await User.deleteMany({ email: { $in: [superEmail, agentEmail, dupEmail] } });
    await disconnectDB();
  }
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
