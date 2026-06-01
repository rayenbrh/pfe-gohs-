/**
 * Full Inova Ride demo seed — agencies, fleet, clients, reservations, invoices, maintenance.
 *
 * Usage:
 *   npm run seed              # idempotent — skips existing records
 *   npm run seed:fresh        # wipes tenant demo data and re-seeds
 *
 * Env overrides: see seed-data.ts and .env.example
 */
import dotenv from 'dotenv';
import mongoose, { type Connection, type Types } from 'mongoose';

import { connectDB, disconnectDB } from '../config/db';
import { getAgencyConnection } from '../config/tenantDB';
import Agency from '../models/Agency';
import SuperAdmin from '../models/SuperAdmin';
import { getCounterModel } from '../models/Counter';
import { getMaintenanceLogModel } from '../models/MaintenanceLog';
import { getUserModel } from '../models/User';
import { getVehicleModel } from '../models/Vehicle';

import {
  DEFAULT_AGENCY,
  PICKUP_LOCATIONS,
  SEED_CLIENTS,
  SEED_STAFF,
  SEED_VEHICLES,
} from './seed-data';

dotenv.config();

const FRESH = process.env.SEED_FRESH === 'true' || process.argv.includes('--fresh');
const YEAR = new Date().getFullYear();

const SA_EMAIL = process.env.SA_EMAIL ?? 'superadmin@inovaride.com';
const SA_PASSWORD = process.env.SA_PASSWORD ?? 'SuperAdmin123!';
const SA_NAME = process.env.SA_NAME ?? 'Super Admin Inova';

function daysAgo(n: number): Date {
  const d = new Date();
  d.setDate(d.getDate() - n);
  d.setHours(10, 0, 0, 0);
  return d;
}

function daysFromNow(n: number): Date {
  const d = new Date();
  d.setDate(d.getDate() + n);
  d.setHours(10, 0, 0, 0);
  return d;
}

function addDays(base: Date, n: number): Date {
  const d = new Date(base);
  d.setDate(d.getDate() + n);
  return d;
}

function log(msg: string): void {
  console.log(msg);
}

async function seedSuperAdmin(): Promise<void> {
  const existing = await SuperAdmin.findOne({ email: SA_EMAIL.toLowerCase() });
  if (existing) {
    log(`  skip  SuperAdmin ${SA_EMAIL} — already exists`);
    return;
  }
  await SuperAdmin.create({ name: SA_NAME, email: SA_EMAIL, password: SA_PASSWORD });
  log(`  created SuperAdmin ${SA_EMAIL}`);
}

async function ensureAgency(): Promise<{ dbName: string; slug: string }> {
  const dbName = `agency_${DEFAULT_AGENCY.slug.replace(/-/g, '_')}`;
  let agency = await Agency.findOne({ slug: DEFAULT_AGENCY.slug });

  if (!agency) {
    agency = await Agency.create({
      name: DEFAULT_AGENCY.name,
      slug: DEFAULT_AGENCY.slug,
      dbName,
      address: DEFAULT_AGENCY.address,
      phone: DEFAULT_AGENCY.phone,
      isActive: true,
    });
    log(`  created agency "${agency.name}" (${agency.slug})`);
  } else {
    log(`  found  agency "${agency.name}" (${agency.slug})`);
  }

  return { dbName: agency.dbName, slug: agency.slug };
}

async function clearTenant(conn: Connection): Promise<void> {
  const names = ['users', 'vehicles', 'reservations', 'invoices', 'contracts', 'maintenancelogs', 'counters'];
  for (const name of names) {
    const col = conn.collection(name);
    const { deletedCount } = await col.deleteMany({});
    log(`  cleared ${name}: ${deletedCount} docs`);
  }
}

async function seedStaff(conn: Connection): Promise<Record<string, Types.ObjectId>> {
  const User = getUserModel(conn);
  const ids: Record<string, Types.ObjectId> = {};

  for (const staff of SEED_STAFF) {
    let user = await User.findOne({ email: staff.email.toLowerCase() });
    if (!user) {
      user = await User.create({
        name: staff.name,
        email: staff.email,
        password: staff.password,
        role: staff.role,
        isActive: true,
        lastLogin: daysAgo(staff.role === 'admin' ? 0 : 3),
      });
      log(`  created staff ${staff.email} (${staff.role})`);
    } else {
      log(`  skip  staff ${staff.email}`);
    }
    ids[staff.email] = user._id;
  }

  return ids;
}

async function seedClients(conn: Connection): Promise<Types.ObjectId[]> {
  const User = getUserModel(conn);
  const ids: Types.ObjectId[] = [];

  for (const c of SEED_CLIENTS) {
    let user = await User.findOne({ email: c.email.toLowerCase() });
    if (!user) {
      user = await User.create({
        email: c.email,
        password: c.password,
        role: 'client',
        firstName: c.firstName,
        lastName: c.lastName,
        name: `${c.firstName} ${c.lastName}`,
        phone: c.phone,
        nationality: c.nationality,
        idType: c.idType,
        idNumber: c.idNumber,
        address: c.address,
        dateOfBirth: c.dateOfBirth,
        totalRentals: c.totalRentals,
        isActive: true,
        lastLogin: c.lastLoginDaysAgo != null ? daysAgo(c.lastLoginDaysAgo) : undefined,
      });
      log(`  created client ${c.email}`);
    } else {
      log(`  skip  client ${c.email}`);
    }
    ids.push(user._id);
  }

  return ids;
}

async function seedVehicles(
  conn: Connection,
  adminId: Types.ObjectId,
): Promise<Types.ObjectId[]> {
  const Vehicle = getVehicleModel(conn);
  const ids: Types.ObjectId[] = [];

  for (const v of SEED_VEHICLES) {
    let doc = await Vehicle.findOne({ licensePlate: v.licensePlate });
    if (!doc) {
      const nextMaintenanceDate =
        v.maintenanceDueDays != null
          ? daysFromNow(v.maintenanceDueDays)
          : daysFromNow(45 + Math.floor(Math.random() * 60));

      doc = await Vehicle.create({
        brand: v.brand,
        model: v.model,
        year: v.year,
        licensePlate: v.licensePlate,
        category: v.category,
        color: v.color,
        seats: v.seats,
        transmission: v.transmission,
        fuelType: v.fuelType,
        pricePerDay: v.pricePerDay,
        images: v.images,
        description: v.description,
        features: v.features,
        mileage: v.mileage,
        isAvailable: v.isAvailable,
        isActive: true,
        nextMaintenanceDate,
        maintenanceIntervalKm: 10000,
        addedBy: adminId,
      });
      log(`  created vehicle ${v.brand} ${v.model} [${v.licensePlate}]`);
    } else {
      log(`  skip  vehicle ${v.licensePlate}`);
    }
    ids.push(doc._id);
  }

  return ids;
}

async function seedMaintenance(conn: Connection, vehicleIds: Types.ObjectId[]): Promise<void> {
  const MaintenanceLog = getMaintenanceLogModel(conn);
  const Vehicle = getVehicleModel(conn);
  const count = await MaintenanceLog.countDocuments();
  if (count > 0 && !FRESH) {
    log(`  skip  maintenance logs (${count} exist)`);
    return;
  }

  const types = ['oil_change', 'inspection', 'tire_change', 'scheduled', 'repair'] as const;
  let created = 0;

  for (let i = 0; i < vehicleIds.length; i++) {
    const vehicleId = vehicleIds[i]!;
    const vehicle = await Vehicle.findById(vehicleId);
    if (!vehicle) continue;

    const logsCount = 2 + (i % 3);
    for (let j = 0; j < logsCount; j++) {
      const performedAt = daysAgo(120 - j * 45 - i * 7);
      const mileageAtService = Math.max(5000, vehicle.mileage - (logsCount - j) * 8500);
      await MaintenanceLog.create({
        vehicle: vehicleId,
        type: types[(i + j) % types.length],
        description: `Entretien périodique — ${vehicle.brand} ${vehicle.model}`,
        cost: 80 + j * 45 + (i % 4) * 30,
        mileageAtService,
        performedAt,
        performedBy: j % 2 === 0 ? 'Garage Auto Tunis' : 'Atelier Inova Ride',
        parts: [{ name: 'Filtre huile + main d\'œuvre', cost: 65 + j * 20 }],
        nextScheduledDate: daysFromNow(30 + i * 5),
        nextScheduledMileage: mileageAtService + 10000,
      });
      created++;
    }
  }

  log(`  created ${created} maintenance logs`);
}

interface RawReservation {
  reservationNumber: string;
  reference: string;
  vehicle: Types.ObjectId;
  client: Types.ObjectId;
  agent?: Types.ObjectId;
  startDate: Date;
  endDate: Date;
  totalDays: number;
  pricePerDay: number;
  totalPrice: number;
  depositAmount: number;
  status: 'pending' | 'confirmed' | 'active' | 'completed' | 'cancelled';
  pickupLocation: string;
  returnLocation: string;
  paymentStatus: 'unpaid' | 'partial' | 'paid';
  paymentMethod: 'cash' | 'card' | 'online';
  notes?: string;
  actualReturnDate?: Date;
  cancellationReason?: string;
  cancelledAt?: Date;
  createdAt: Date;
  updatedAt: Date;
}

async function seedReservationsAndBilling(
  conn: Connection,
  vehicleIds: Types.ObjectId[],
  clientIds: Types.ObjectId[],
  staffIds: Record<string, Types.ObjectId>,
): Promise<void> {
  const existing = await conn.collection('reservations').countDocuments();
  if (existing > 0 && !FRESH) {
    log(`  skip  reservations (${existing} exist)`);
    return;
  }

  const agentId = staffIds['agent@inovaride.com'];
  const reservations: RawReservation[] = [];
  let seq = 1;

  const mkRes = (
    vehicleIdx: number,
    clientIdx: number,
    start: Date,
    end: Date,
    status: RawReservation['status'],
    paymentStatus: RawReservation['paymentStatus'],
    pickup: string,
  ): RawReservation => {
    const pricePerDay = SEED_VEHICLES[vehicleIdx]!.pricePerDay;
    const totalDays = Math.max(1, Math.ceil((end.getTime() - start.getTime()) / 86400000));
    const totalPrice = totalDays * pricePerDay;
    const num = `RES-${YEAR}-${String(seq++).padStart(4, '0')}`;
    const createdAt = addDays(start, -3);
    return {
      reservationNumber: num,
      reference: num,
      vehicle: vehicleIds[vehicleIdx]!,
      client: clientIds[clientIdx]!,
      agent: agentId,
      startDate: start,
      endDate: end,
      totalDays,
      pricePerDay,
      totalPrice,
      depositAmount: Math.round(totalPrice * 0.2),
      status,
      pickupLocation: pickup,
      returnLocation: pickup,
      paymentStatus,
      paymentMethod: paymentStatus === 'paid' ? 'card' : 'cash',
      createdAt,
      updatedAt: status === 'completed' ? end : createdAt,
      ...(status === 'completed' ? { actualReturnDate: end } : {}),
      ...(status === 'cancelled'
        ? {
            cancellationReason: 'Client a reporté son voyage',
            cancelledAt: addDays(start, -1),
          }
        : {}),
    } as RawReservation;
  };

  // ── Historical completed rentals (past 18 months) ─────────────────────────
  const history: Array<[number, number, number, number, string]> = [
    [0, 0, 420, 415, PICKUP_LOCATIONS[1]],
    [1, 1, 380, 375, PICKUP_LOCATIONS[2]],
    [4, 2, 350, 345, PICKUP_LOCATIONS[0]],
    [10, 3, 300, 295, PICKUP_LOCATIONS[3]],
    [6, 4, 280, 273, PICKUP_LOCATIONS[5]],
    [8, 5, 250, 245, PICKUP_LOCATIONS[4]],
    [11, 6, 220, 215, PICKUP_LOCATIONS[1]],
    [2, 7, 200, 195, PICKUP_LOCATIONS[0]],
    [5, 8, 180, 175, PICKUP_LOCATIONS[2]],
    [9, 9, 160, 155, PICKUP_LOCATIONS[1]],
    [3, 0, 140, 135, PICKUP_LOCATIONS[0]],
    [12, 1, 120, 115, PICKUP_LOCATIONS[5]],
    [13, 2, 100, 95, PICKUP_LOCATIONS[1]],
    [14, 3, 90, 85, PICKUP_LOCATIONS[2]],
    [15, 4, 75, 70, PICKUP_LOCATIONS[1]],
    [7, 5, 60, 55, PICKUP_LOCATIONS[3]],
    [0, 6, 45, 42, PICKUP_LOCATIONS[4]],
    [10, 7, 35, 30, PICKUP_LOCATIONS[0]],
    [1, 8, 28, 25, PICKUP_LOCATIONS[1]],
    [4, 9, 20, 17, PICKUP_LOCATIONS[2]],
  ];

  for (const [v, c, startDaysAgo, endDaysAgo, loc] of history) {
    reservations.push(
      mkRes(v, c, daysAgo(startDaysAgo), daysAgo(endDaysAgo), 'completed', 'paid', loc),
    );
  }

  // ── Active & upcoming ─────────────────────────────────────────────────────
  reservations.push(
    mkRes(1, 0, daysAgo(2), daysFromNow(5), 'active', 'paid', PICKUP_LOCATIONS[0]),
    mkRes(10, 3, daysFromNow(1), daysFromNow(8), 'confirmed', 'paid', PICKUP_LOCATIONS[3]),
    mkRes(5, 4, daysFromNow(3), daysFromNow(10), 'confirmed', 'partial', PICKUP_LOCATIONS[2]),
    mkRes(8, 1, daysFromNow(0), daysFromNow(4), 'pending', 'unpaid', PICKUP_LOCATIONS[1]),
    mkRes(11, 6, daysAgo(1), daysFromNow(6), 'active', 'paid', PICKUP_LOCATIONS[5]),
  );

  // ── Cancelled ─────────────────────────────────────────────────────────────
  reservations.push(
    mkRes(3, 2, daysFromNow(10), daysFromNow(15), 'cancelled', 'unpaid', PICKUP_LOCATIONS[0]),
    mkRes(6, 5, daysAgo(5), daysAgo(2), 'cancelled', 'unpaid', PICKUP_LOCATIONS[4]),
  );

  await conn.collection('reservations').insertMany(reservations);

  // ── Invoices + contracts for completed paid reservations ──────────────────
  const invoices: Record<string, unknown>[] = [];
  const contracts: Record<string, unknown>[] = [];
  let invSeq = 1;
  let ctrSeq = 1;

  for (const r of reservations.filter((x) => x.status === 'completed' && x.paymentStatus === 'paid')) {
    const invNum = `INV-${YEAR}-${String(invSeq++).padStart(4, '0')}`;
    const ctrNum = `CTR-${YEAR}-${String(ctrSeq++).padStart(4, '0')}`;
    const taxRate = 19;
    const subtotal = r.totalPrice;
    const taxAmount = Math.round(subtotal * (taxRate / 100) * 100) / 100;
    const totalAmount = subtotal + taxAmount;

    invoices.push({
      invoiceNumber: invNum,
      reference: invNum,
      reservation: r.reservationNumber,
      client: r.client,
      lineItems: [
        {
          description: `Location véhicule — ${r.totalDays} jour(s)`,
          quantity: r.totalDays,
          unitPrice: r.pricePerDay,
          total: r.totalPrice,
        },
      ],
      subtotal,
      taxRate,
      taxAmount,
      discountAmount: 0,
      totalAmount,
      status: 'paid',
      issuedAt: r.endDate,
      dueDate: addDays(r.endDate, 7),
      paidAt: addDays(r.endDate, 1),
      paymentMethod: r.paymentMethod,
      createdAt: r.endDate,
      updatedAt: r.endDate,
    });

    contracts.push({
      contractNumber: ctrNum,
      reservation: r.reservationNumber,
      pdfUrl: `/uploads/contracts/${ctrNum}.pdf`,
      generatedAt: r.startDate,
      signedAt: r.startDate,
      terms: 'Conditions générales Inova Ride — location courte durée Tunisie.',
      isVoid: false,
      createdAt: r.startDate,
      updatedAt: r.endDate,
    });
  }

  // Link reservation ObjectIds for invoices/contracts after insert
  const insertedRes = await conn
    .collection('reservations')
    .find({})
    .project({ _id: 1, reservationNumber: 1 })
    .toArray();

  const resByNumber = new Map(
    insertedRes.map((d) => [d.reservationNumber as string, d._id as Types.ObjectId]),
  );

  for (const inv of invoices) {
    const ref = inv.reservation as string;
    inv.reservation = resByNumber.get(ref)!;
  }
  for (const ctr of contracts) {
    const ref = ctr.reservation as string;
    ctr.reservation = resByNumber.get(ref)!;
  }

  if (invoices.length) await conn.collection('invoices').insertMany(invoices);
  if (contracts.length) await conn.collection('contracts').insertMany(contracts);

  // ── Counters ──────────────────────────────────────────────────────────────
  const Counter = getCounterModel(conn);
  await Counter.findByIdAndUpdate(`RES-${YEAR}`, { seq: seq - 1 }, { upsert: true });
  await Counter.findByIdAndUpdate(`INV-${YEAR}`, { seq: invSeq - 1 }, { upsert: true });
  await Counter.findByIdAndUpdate(`CTR-${YEAR}`, { seq: ctrSeq - 1 }, { upsert: true });

  log(`  created ${reservations.length} reservations, ${invoices.length} invoices, ${contracts.length} contracts`);
}

async function seed(): Promise<void> {
  log('\n══════════════════════════════════════════');
  log('  INOVA RIDE — Full demo seed');
  log(`  Mode: ${FRESH ? 'FRESH (reset tenant data)' : 'incremental'}`);
  log('══════════════════════════════════════════\n');

  await connectDB();

  log('▸ Master DB — Super Admin');
  await seedSuperAdmin();

  log('\n▸ Master DB — Agency');
  const { dbName, slug } = await ensureAgency();
  const conn = await getAgencyConnection(dbName);

  if (FRESH) {
    log('\n▸ Tenant DB — clearing demo collections');
    await clearTenant(conn);
  }

  log('\n▸ Tenant DB — Staff');
  const staffIds = await seedStaff(conn);

  log('\n▸ Tenant DB — Clients');
  const clientIds = await seedClients(conn);

  log('\n▸ Tenant DB — Fleet (VW, Skoda, Seat, Hyundai, Toyota, utilitaires)');
  const adminId = staffIds['admin@inovaride.com']!;
  const vehicleIds = await seedVehicles(conn, adminId);

  log('\n▸ Tenant DB — Maintenance history');
  await seedMaintenance(conn, vehicleIds);

  log('\n▸ Tenant DB — Reservations, invoices & contracts');
  await seedReservationsAndBilling(conn, vehicleIds, clientIds, staffIds);

  log('\n══════════════════════════════════════════');
  log('  Seed complete!\n');
  log('  Super Admin (master):');
  log(`    ${SA_EMAIL} / ${SA_PASSWORD}`);
  log('\n  Agency admin:');
  log(`    ${SEED_STAFF[0]!.email} / ${SEED_STAFF[0]!.password}`);
  log(`    Login: http://localhost:3000/fr/agency/${slug}/auth/login`);
  log('\n  Agency employee:');
  log(`    ${SEED_STAFF[1]!.email} / ${SEED_STAFF[1]!.password}`);
  log('\n  Sample client:');
  log(`    ${SEED_CLIENTS[0]!.email} / ${SEED_CLIENTS[0]!.password}`);
  log(`\n  Fleet: ${SEED_VEHICLES.length} vehicles seeded`);
  log('══════════════════════════════════════════\n');

  mongoose.connection.removeAllListeners('disconnected');
  await disconnectDB();
}

seed().catch((err) => {
  console.error(err);
  process.exit(1);
});
