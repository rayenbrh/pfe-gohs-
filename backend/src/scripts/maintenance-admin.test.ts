/**
 * Maintenance, admin stats & cron jobs checkpoint — run: npm run test:maintenance-admin
 */
import 'express-async-errors';

import express from 'express';
import dotenv from 'dotenv';

import { connectDB, disconnectDB } from '../config/db';
import Client from '../models/Client';
import Invoice from '../models/Invoice';
import MaintenanceLog from '../models/MaintenanceLog';
import mongoose from 'mongoose';
import Reservation from '../models/Reservation';
import User from '../models/User';
import Vehicle from '../models/Vehicle';
import { errorHandler } from '../middleware/error.middleware';
import {
  runExpiredPaymentsJob,
  runMaintenanceAlertJob,
  runReservationReminderJob,
} from '../jobs/maintenanceAlert.job';
import authRoutes from '../routes/auth.routes';
import adminRoutes from '../routes/admin.routes';
import maintenanceRoutes from '../routes/maintenance.routes';

dotenv.config();

const TEST_PORT = 5103;
const AUTH = `http://127.0.0.1:${TEST_PORT}/api/auth`;
const MAINT = `http://127.0.0.1:${TEST_PORT}/api/maintenance`;
const ADMIN = `http://127.0.0.1:${TEST_PORT}/api/admin`;

const PASSWORD = 'TestPass1';
const ts = Date.now();

const sampleVehicle = (plate: string) => ({
  brand: 'Toyota',
  model: 'Corolla',
  year: 2022,
  licensePlate: plate,
  category: 'economy' as const,
  color: 'White',
  seats: 5,
  transmission: 'automatic' as const,
  fuelType: 'petrol' as const,
  pricePerDay: 80,
  description: 'Maintenance test vehicle',
  isAvailable: true,
  mileage: 12000,
});

async function login(email: string): Promise<string> {
  const res = await fetch(`${AUTH}/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email, password: PASSWORD }),
  });
  const json = (await res.json()) as Record<string, unknown>;
  return ((json.data as Record<string, unknown>).accessToken as string) ?? '';
}

async function api(
  base: string,
  method: string,
  path: string,
  token: string,
  body?: Record<string, unknown>,
): Promise<{ status: number; body: Record<string, unknown> }> {
  const res = await fetch(`${base}${path}`, {
    method,
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${token}`,
    },
    body: body ? JSON.stringify(body) : undefined,
  });
  const json = (await res.json().catch(() => ({}))) as Record<string, unknown>;
  return { status: res.status, body: json };
}

function assert(cond: boolean, msg: string) {
  if (!cond) throw new Error(`FAIL: ${msg}`);
}

async function main() {
  await connectDB();

  const adminEmail = `admin.maint.${ts}@test.inova`;
  const superEmail = `super.maint.${ts}@test.inova`;
  const agentEmail = `agent.maint.${ts}@test.inova`;

  await User.deleteMany({ email: { $in: [adminEmail, superEmail, agentEmail] } });
  await User.create({ name: 'Admin Maint', email: adminEmail, password: PASSWORD, role: 'admin' });
  await User.create({ name: 'Super Maint', email: superEmail, password: PASSWORD, role: 'super_admin' });
  await User.create({ name: 'Agent Maint', email: agentEmail, password: PASSWORD, role: 'agent' });

  const plate = `MT${String(ts).slice(-5)}`;
  const vehicle = await Vehicle.create(sampleVehicle(plate));

  const app = express();
  app.use(express.json());
  app.use('/api/auth', authRoutes);
  app.use('/api/maintenance', maintenanceRoutes);
  app.use('/api/admin', adminRoutes);
  app.use(errorHandler);

  const server = app.listen(TEST_PORT);

  try {
    const adminToken = await login(adminEmail);
    const agentToken = await login(agentEmail);
    assert(!!adminToken, 'admin login failed');
    assert(!!agentToken, 'agent login failed');

    const nextDate = new Date(Date.now() + 60 * 24 * 60 * 60 * 1000);
    const performedAt = new Date().toISOString();

    const createRes = await api(MAINT, 'POST', '', agentToken, {
      vehicleId: String(vehicle._id),
      type: 'oil_change',
      description: 'Routine oil change and filter replacement',
      cost: 120,
      mileageAtService: 12500,
      performedAt,
      performedBy: 'Garage Central',
      nextScheduledDate: nextDate.toISOString(),
      notes: 'Used synthetic oil',
    });
    assert(createRes.status === 201, `POST maintenance expected 201, got ${createRes.status}`);

    const updatedVehicle = await Vehicle.findById(vehicle._id);
    assert(
      Math.abs((updatedVehicle?.nextMaintenanceDate?.getTime() ?? 0) - nextDate.getTime()) < 2000,
      'vehicle.nextMaintenanceDate not updated after POST',
    );
    assert(updatedVehicle?.mileage === 12500, 'vehicle.mileage not updated after POST');

    await Vehicle.findByIdAndUpdate(vehicle._id, {
      nextMaintenanceDate: new Date(Date.now() + 10 * 24 * 60 * 60 * 1000),
    });

    const upcomingRes = await api(MAINT, 'GET', '?upcoming=true', adminToken);
    assert(upcomingRes.status === 200, 'GET upcoming failed');
    const upcomingData = upcomingRes.body.data as Record<string, unknown>;
    const upcomingVehicles = upcomingData.vehicles as unknown[];
    assert(Array.isArray(upcomingVehicles) && upcomingVehicles.length >= 1, 'upcoming=true returned no vehicles');

    const statsRes = await api(ADMIN, 'GET', '/stats', adminToken);
    assert(statsRes.status === 200, 'GET /admin/stats failed');
    const stats = statsRes.body.data as Record<string, unknown>;
    for (const key of ['vehicles', 'reservations', 'clients', 'revenue', 'payments']) {
      assert(stats[key] != null, `stats.${key} is null`);
    }
    const vehiclesStats = stats.vehicles as Record<string, number>;
    assert(typeof vehiclesStats.total === 'number', 'stats.vehicles.total missing');
    assert(typeof vehiclesStats.available === 'number', 'stats.vehicles.available missing');

    const revenueChart = await api(ADMIN, 'GET', '/charts/revenue?period=12months', adminToken);
    assert(revenueChart.status === 200, 'GET revenue chart failed');
    const chartData = revenueChart.body.data as Array<{ month: string; revenue: number }>;
    assert(chartData.length === 12, `revenue chart expected 12 months, got ${chartData.length}`);
    for (const point of chartData) {
      assert(typeof point.month === 'string', 'chart month invalid');
      assert(typeof point.revenue === 'number', 'chart revenue invalid');
    }

    const vehicleHistory = await api(MAINT, 'GET', `/vehicle/${vehicle._id}`, adminToken);
    assert(vehicleHistory.status === 200, 'GET vehicle history failed');
    const historyData = vehicleHistory.body.data as Record<string, unknown>;
    const summary = historyData.summary as Record<string, unknown>;
    assert((summary.totalEntries as number) >= 1, 'vehicle history summary missing entries');

    await Vehicle.findByIdAndUpdate(vehicle._id, {
      nextMaintenanceDate: new Date(Date.now() + 3 * 24 * 60 * 60 * 1000),
    });

    const alertCount = await runMaintenanceAlertJob();
    assert(alertCount >= 1, 'maintenance alert job sent no alerts');

    const client = await Client.create({
      firstName: 'Test',
      lastName: 'Client',
      email: `client.maint.${ts}@test.inova`,
      phone: `+216${ts}`,
      nationality: 'Tunisian',
      idType: 'passport',
      idNumber: `PP${ts}`,
    });

    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1);
    tomorrow.setHours(10, 0, 0, 0);

    await Reservation.create({
      reservationNumber: `RES-TEST-${ts}`,
      vehicle: vehicle._id,
      client: client._id,
      agent: (await User.findOne({ email: adminEmail }))!._id,
      startDate: tomorrow,
      endDate: new Date(tomorrow.getTime() + 2 * 24 * 60 * 60 * 1000),
      totalDays: 2,
      pricePerDay: 80,
      totalPrice: 160,
      pickupLocation: 'Airport',
      returnLocation: 'Airport',
      status: 'confirmed',
      paymentMethod: 'cash',
    });

    const reminderCount = await runReservationReminderJob();
    assert(reminderCount >= 1, 'reservation reminder job found no reservations');

    await Vehicle.findByIdAndUpdate(vehicle._id, { isAvailable: false });
    const expiredRes = await Reservation.create({
      reservationNumber: `RES-EXP-${ts}`,
      vehicle: vehicle._id,
      client: client._id,
      agent: (await User.findOne({ email: adminEmail }))!._id,
      startDate: new Date(Date.now() + 5 * 24 * 60 * 60 * 1000),
      endDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
      totalDays: 2,
      pricePerDay: 80,
      totalPrice: 160,
      pickupLocation: 'Downtown',
      returnLocation: 'Downtown',
      status: 'pending',
      paymentMethod: 'online',
      paymentStatus: 'unpaid',
      createdAt: new Date(Date.now() - 45 * 60 * 1000),
    });

    await Reservation.collection.updateOne(
      { _id: expiredRes._id },
      { $set: { createdAt: new Date(Date.now() - 45 * 60 * 1000) } },
    );

    const expiredCount = await runExpiredPaymentsJob();
    assert(expiredCount >= 1, 'expired payments job cancelled nothing');

    const cancelled = await Reservation.findById(expiredRes._id);
    assert(cancelled?.status === 'cancelled', 'expired reservation not cancelled');
    assert(cancelled?.paymentStatus === 'unpaid', 'expired reservation paymentStatus not unpaid');

    const freedVehicle = await Vehicle.findById(vehicle._id);
    assert(freedVehicle?.isAvailable === true, 'vehicle not freed after expired payment cleanup');

    console.log('PASS: maintenance-admin checkpoint');
    mongoose.connection.removeAllListeners('disconnected');
    process.exit(0);
  } finally {
    await MaintenanceLog.deleteMany({ vehicle: vehicle._id });
    await Reservation.deleteMany({ vehicle: vehicle._id });
    await Vehicle.findByIdAndDelete(vehicle._id);
    await User.deleteMany({ email: { $in: [adminEmail, superEmail, agentEmail] } });
    await Client.deleteMany({ email: `client.maint.${ts}@test.inova` });
    server.close();
    await disconnectDB();
  }
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
