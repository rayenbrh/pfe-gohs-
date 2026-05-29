/**
 * Reservation API checkpoint tests — run: npm run test:reservations
 */
import 'express-async-errors';

import express from 'express';
import dotenv from 'dotenv';

import { connectDB, disconnectDB } from '../config/db';
import Client from '../models/Client';
import Invoice from '../models/Invoice';
import Reservation from '../models/Reservation';
import User from '../models/User';
import Vehicle from '../models/Vehicle';
import { errorHandler } from '../middleware/error.middleware';
import authRoutes from '../routes/auth.routes';
import reservationRoutes from '../routes/reservation.routes';

dotenv.config();

const TEST_PORT = 5101;
const BASE = `http://127.0.0.1:${TEST_PORT}/api/reservations`;
const AUTH_BASE = `http://127.0.0.1:${TEST_PORT}/api/auth`;

const PASSWORD = 'TestPass1';
const ts = Date.now();

function futureDate(daysFromNow: number): string {
  const d = new Date();
  d.setDate(d.getDate() + daysFromNow);
  d.setHours(12, 0, 0, 0);
  return d.toISOString();
}

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

  await Invoice.deleteMany({ $or: [{ reference: null }, { reference: { $exists: false } }] });
  await Reservation.deleteMany({ $or: [{ reference: null }, { reference: { $exists: false } }] });

  const adminEmail = `admin.res.${ts}@test.inova`;
  const agentEmail = `agent.res.${ts}@test.inova`;
  const superEmail = `super.res.${ts}@test.inova`;

  await User.deleteMany({ email: { $in: [adminEmail, agentEmail, superEmail] } });

  await User.create({ name: 'Admin', email: adminEmail, password: PASSWORD, role: 'admin' });
  await User.create({ name: 'Agent', email: agentEmail, password: PASSWORD, role: 'agent' });
  await User.create({ name: 'Super', email: superEmail, password: PASSWORD, role: 'super_admin' });

  const plate = `RS${String(ts).slice(-5)}`;
  const vehicle = await Vehicle.create({
    brand: 'Toyota',
    model: 'Yaris',
    year: 2024,
    licensePlate: plate,
    category: 'economy',
    color: 'Red',
    seats: 5,
    transmission: 'automatic',
    fuelType: 'petrol',
    pricePerDay: 120,
    isAvailable: true,
    isActive: true,
  });

  await Reservation.deleteMany({ vehicle: vehicle._id });

  const client = await Client.create({
    firstName: 'Jean',
    lastName: 'Dupont',
    email: `client.res.${ts}@test.inova`,
    phone: `+216${ts}`,
    nationality: 'French',
    idType: 'passport',
    idNumber: `PP${ts}`,
  });

  const app = express();
  app.use(express.json());
  app.use('/api/auth', authRoutes);
  app.use('/api/reservations', reservationRoutes);
  app.use(errorHandler);

  const server = app.listen(TEST_PORT);

  const startDate = futureDate(14);
  const endDate = futureDate(18);
  const juneStart = '2026-06-20T10:00:00.000Z';
  const juneEnd = '2026-06-25T10:00:00.000Z';

  let reservationId = '';
  let juneReservationId = '';

  try {
    const agentToken = await login(agentEmail);
    const superToken = await login(superEmail);

    // 1. POST creates reservation with RES-YYYY-XXXX number
    const createRes = await request(
      'POST',
      '/',
      {
        vehicleId: vehicle._id.toString(),
        clientId: client._id.toString(),
        startDate,
        endDate,
        pickupLocation: 'Tunis Airport',
        returnLocation: 'Tunis Airport',
        paymentMethod: 'cash',
      },
      agentToken,
    );
    assert(createRes.status === 201, `create status ${createRes.status}: ${JSON.stringify(createRes.body)}`);
    const reservation = (createRes.body.data as Record<string, unknown>).reservation as Record<
      string,
      unknown
    >;
    assert(typeof reservation.reservationNumber === 'string', 'reservationNumber missing');
    assert(/^RES-\d{4}-\d{4}$/.test(reservation.reservationNumber as string), 'bad number format');
    reservationId = String(reservation.id ?? reservation._id);
    console.log(`✓ POST creates reservation ${reservation.reservationNumber}`);

    // 2. Overlapping booking → 409
    const conflictRes = await request(
      'POST',
      '/',
      {
        vehicleId: vehicle._id.toString(),
        clientId: client._id.toString(),
        startDate,
        endDate,
        pickupLocation: 'Tunis',
        returnLocation: 'Tunis',
        paymentMethod: 'card',
      },
      agentToken,
    );
    assert(conflictRes.status === 409, `conflict status ${conflictRes.status}`);
    assert(
      conflictRes.body.message === 'Vehicle not available for selected dates',
      `conflict message: ${conflictRes.body.message}`,
    );
    console.log('✓ Overlapping booking returns 409');

    // Create June reservation for calendar test (after cancel frees the vehicle)
    await Vehicle.findByIdAndUpdate(vehicle._id, { isAvailable: false });
    const cancelRes = await request(
      'PATCH',
      `/${reservationId}/status`,
      { status: 'cancelled', cancellationReason: 'Client request' },
      agentToken,
    );
    assert(cancelRes.status === 200, `cancel status ${cancelRes.status}`);
    const updatedVehicle = await Vehicle.findById(vehicle._id);
    assert(updatedVehicle?.isAvailable === true, 'vehicle not freed after cancel');
    console.log('✓ PATCH cancel frees vehicle');

    const juneRes = await request(
      'POST',
      '/',
      {
        vehicleId: vehicle._id.toString(),
        clientId: client._id.toString(),
        startDate: juneStart,
        endDate: juneEnd,
        pickupLocation: 'Sfax',
        returnLocation: 'Sfax',
        paymentMethod: 'online',
      },
      agentToken,
    );
    assert(juneRes.status === 201, `june create status ${juneRes.status}: ${JSON.stringify(juneRes.body)}`);
    const juneReservation = (juneRes.body.data as Record<string, unknown>).reservation as Record<
      string,
      unknown
    >;
    juneReservationId = String(juneReservation.id ?? juneReservation._id);

    // Confirm June reservation for status filter
    await request(
      'PATCH',
      `/${juneReservationId}/status`,
      { status: 'confirmed' },
      agentToken,
    );

    // 4. Calendar for June 2026
    const calRes = await request('GET', '/calendar?month=2026-06', undefined, agentToken);
    assert(calRes.status === 200, `calendar status ${calRes.status}`);
    const events = (calRes.body.data as Record<string, unknown>).events as unknown[];
    assert(events.length >= 1, 'calendar events empty');
    console.log('✓ GET /calendar?month=2026-06');

    // 5. Filter by status=confirmed
    const confirmedRes = await request('GET', '/?status=confirmed', undefined, agentToken);
    const confirmedList = (confirmedRes.body.data as Record<string, unknown>)
      .reservations as Array<{ status: string }>;
    assert(
      confirmedList.every((r) => r.status === 'confirmed'),
      'status filter failed',
    );
    console.log('✓ GET ?status=confirmed');

    // 6. Agent cannot DELETE
    const deleteRes = await request('DELETE', `/${reservationId}`, undefined, agentToken);
    assert(deleteRes.status === 403, `agent delete status ${deleteRes.status}`);
    console.log('✓ Agent DELETE returns 403');

    // Cancel June reservation then super_admin can delete
    await request(
      'PATCH',
      `/${juneReservationId}/status`,
      { status: 'cancelled', cancellationReason: 'Test cleanup' },
      agentToken,
    );
    const superDelete = await request('DELETE', `/${juneReservationId}`, undefined, superToken);
    assert(superDelete.status === 200, `super delete status ${superDelete.status}`);

    console.log('\nAll reservation checkpoint tests passed.');
  } finally {
    server.close();
    await Reservation.deleteMany({ vehicle: vehicle._id });
    await Client.deleteMany({ idNumber: `PP${ts}` });
    await Vehicle.deleteMany({ licensePlate: plate });
    await User.deleteMany({ email: { $in: [adminEmail, agentEmail, superEmail] } });
    await disconnectDB();
  }
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
