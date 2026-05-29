/**
 * Vehicle API checkpoint tests — run: npm run test:vehicles
 */
import 'express-async-errors';

import express from 'express';
import dotenv from 'dotenv';

import { connectDB, disconnectDB } from '../config/db';
import Client from '../models/Client';
import Reservation from '../models/Reservation';
import User from '../models/User';
import Vehicle from '../models/Vehicle';
import { errorHandler } from '../middleware/error.middleware';
import vehicleRoutes from '../routes/vehicle.routes';
import authRoutes from '../routes/auth.routes';

dotenv.config();

const TEST_PORT = 5100;
const BASE = `http://127.0.0.1:${TEST_PORT}/api/vehicles`;
const AUTH_BASE = `http://127.0.0.1:${TEST_PORT}/api/auth`;

const PASSWORD = 'TestPass1';
const ts = Date.now();

const sampleVehicle = (plate: string, category: 'economy' | 'luxury' = 'economy', brand = 'Toyota') => ({
  brand,
  model: category === 'luxury' ? 'S-Class' : 'Corolla',
  year: 2024,
  licensePlate: plate,
  category,
  color: 'White',
  seats: 5,
  transmission: 'automatic' as const,
  fuelType: 'petrol' as const,
  pricePerDay: category === 'luxury' ? 500 : 100,
  description: `${brand} fleet vehicle for testing`,
});

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

async function login(email: string): Promise<string> {
  const res = await fetch(`${AUTH_BASE}/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email, password: PASSWORD }),
  });
  const json = (await res.json()) as Record<string, unknown>;
  return ((json.data as Record<string, unknown>).accessToken as string) ?? '';
}

function assert(condition: boolean, message: string): void {
  if (!condition) throw new Error(`FAIL: ${message}`);
}

async function main(): Promise<void> {
  await connectDB();

  const adminEmail = `admin.veh.${ts}@test.inova`;
  const agentEmail = `agent.veh.${ts}@test.inova`;
  const superEmail = `super.veh.${ts}@test.inova`;

  await User.deleteMany({ email: { $in: [adminEmail, agentEmail, superEmail] } });

  const admin = await User.create({
    name: 'Admin Vehicle Test',
    email: adminEmail,
    password: PASSWORD,
    role: 'admin',
  });
  await User.create({
    name: 'Agent Vehicle Test',
    email: agentEmail,
    password: PASSWORD,
    role: 'agent',
  });
  await User.create({
    name: 'Super Vehicle Test',
    email: superEmail,
    password: PASSWORD,
    role: 'super_admin',
  });

  const plate1 = `TV${String(ts).slice(-5)}A`;
  const plate2 = `TV${String(ts).slice(-5)}B`;
  const plateLux = `LX${String(ts).slice(-5)}C`;

  await Vehicle.deleteMany({ licensePlate: { $in: [plate1, plate2, plateLux] } });

  const toyota = await Vehicle.create({
    ...sampleVehicle(plate1, 'economy', 'Toyota'),
    isAvailable: true,
    isActive: true,
  });
  await Vehicle.create({
    ...sampleVehicle(plateLux, 'luxury', 'Mercedes'),
    isAvailable: true,
    isActive: true,
  });

  const app = express();
  app.use(express.json());
  app.use('/api/auth', authRoutes);
  app.use('/api/vehicles', vehicleRoutes);
  app.use(errorHandler);

  const server = app.listen(TEST_PORT);

  try {
    const adminToken = await login(adminEmail);
    const agentToken = await login(agentEmail);
    const superToken = await login(superEmail);

    // 1. GET /api/vehicles — paginated, no auth
    const listRes = await request('GET', '/?limit=5');
    assert(listRes.status === 200, `list status ${listRes.status}`);
    assert(listRes.body.status === 'success', 'list status field');
    const vehicles = (listRes.body.data as Record<string, unknown>).vehicles as unknown[];
    assert(Array.isArray(vehicles) && vehicles.length > 0, 'vehicles array empty');
    assert(typeof listRes.body.totalPages === 'number', 'totalPages missing');
    console.log('✓ GET /api/vehicles returns paginated vehicles');

    // 2. category filter
    const luxuryRes = await request('GET', '/?category=luxury');
    const luxuryVehicles = (luxuryRes.body.data as Record<string, unknown>).vehicles as Array<{
      category: string;
    }>;
    assert(
      luxuryVehicles.every((v) => v.category === 'luxury'),
      'category filter failed',
    );
    console.log('✓ GET /api/vehicles?category=luxury');

    // 3. search filter
    const searchRes = await request('GET', '/?search=toyota');
    const searchVehicles = (searchRes.body.data as Record<string, unknown>).vehicles as Array<{
      brand: string;
    }>;
    assert(searchVehicles.some((v) => v.brand.toLowerCase().includes('toyota')), 'search failed');
    console.log('✓ GET /api/vehicles?search=toyota');

    // 4. availability
    const start = new Date();
    start.setDate(start.getDate() + 7);
    const end = new Date(start);
    end.setDate(end.getDate() + 3);
    const availRes = await request(
      'GET',
      `/availability?startDate=${start.toISOString()}&endDate=${end.toISOString()}`,
    );
    assert(availRes.status === 200, `availability status ${availRes.status}`);
    console.log('✓ GET /api/vehicles/availability');

    // 5. POST without auth → 401
    const noAuthRes = await request('POST', '/', sampleVehicle(plate2));
    assert(noAuthRes.status === 401, `no auth status ${noAuthRes.status}`);
    console.log('✓ POST /api/vehicles without token returns 401');

    // 6. POST with agent → 403
    const agentPostRes = await request('POST', '/', sampleVehicle(plate2), agentToken);
    assert(agentPostRes.status === 403, `agent post status ${agentPostRes.status}`);
    console.log('✓ POST /api/vehicles with agent token returns 403');

    // 7. POST with admin → 201
    const createRes = await request('POST', '/', sampleVehicle(plate2), adminToken);
    assert(createRes.status === 201, `create status ${createRes.status}`);
    assert(createRes.body.status === 'success', 'create status field');
    console.log('✓ POST /api/vehicles with admin token returns 201');

    // 8. duplicate license plate → 409
    const dupRes = await request('POST', '/', sampleVehicle(plate2), adminToken);
    assert(dupRes.status === 409, `dup status ${dupRes.status}`);
    assert(
      dupRes.body.message === 'License plate already in use',
      `dup message: ${dupRes.body.message}`,
    );
    console.log('✓ duplicate licensePlate returns 409');

    // 9. DELETE with active reservation → 409
    const client = await Client.create({
      firstName: 'Test',
      lastName: 'Client',
      phone: `+216${ts}`,
      nationality: 'Tunisian',
      idType: 'cin',
      idNumber: `CIN${ts}`,
    });

    const resStart = new Date();
    resStart.setDate(resStart.getDate() + 10);
    const resEnd = new Date(resStart);
    resEnd.setDate(resEnd.getDate() + 5);

    await Reservation.create({
      vehicle: toyota._id,
      client: client._id,
      agent: admin._id,
      startDate: resStart,
      endDate: resEnd,
      pricePerDay: toyota.pricePerDay,
      status: 'confirmed',
      pickupLocation: 'Tunis',
      returnLocation: 'Tunis',
      paymentStatus: 'unpaid',
      paymentMethod: 'cash',
    });

    const deleteRes = await request('DELETE', `/${toyota._id}`, undefined, superToken);
    assert(deleteRes.status === 409, `delete status ${deleteRes.status}`);
    assert(
      deleteRes.body.message === 'Cannot delete a vehicle with active reservations',
      `delete message: ${deleteRes.body.message}`,
    );
    console.log('✓ DELETE with active reservation returns 409');

    console.log('\nAll vehicle checkpoint tests passed.');
  } finally {
    server.close();
    await Reservation.deleteMany({ vehicle: toyota._id });
    await Client.deleteMany({ idNumber: `CIN${ts}` });
    await Vehicle.deleteMany({ licensePlate: { $in: [plate1, plate2, plateLux] } });
    await User.deleteMany({ email: { $in: [adminEmail, agentEmail, superEmail] } });
    await disconnectDB();
  }
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
