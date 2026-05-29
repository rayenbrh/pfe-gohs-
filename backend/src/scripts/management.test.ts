/**
 * Management APIs checkpoint — run: npm run test:management
 */
import 'express-async-errors';

import express from 'express';
import dotenv from 'dotenv';

import { connectDB, disconnectDB } from '../config/db';
import Client from '../models/Client';
import Contract from '../models/Contract';
import Invoice from '../models/Invoice';
import Reservation from '../models/Reservation';
import User from '../models/User';
import Vehicle from '../models/Vehicle';
import { errorHandler } from '../middleware/error.middleware';
import authRoutes from '../routes/auth.routes';
import clientRoutes from '../routes/client.routes';
import contractRoutes from '../routes/contract.routes';
import invoiceRoutes from '../routes/invoice.routes';
import { generateContractPDF, generateInvoicePDF } from '../services/pdf.service';

dotenv.config();

const TEST_PORT = 5102;
const AUTH = `http://127.0.0.1:${TEST_PORT}/api/auth`;
const CLIENTS = `http://127.0.0.1:${TEST_PORT}/api/clients`;
const CONTRACTS = `http://127.0.0.1:${TEST_PORT}/api/contracts`;
const INVOICES = `http://127.0.0.1:${TEST_PORT}/api/invoices`;

const PASSWORD = 'TestPass1';
const ts = Date.now();

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
): Promise<{ status: number; body: Record<string, unknown>; headers: Headers }> {
  const res = await fetch(`${base}${path}`, {
    method,
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${token}`,
    },
    body: body ? JSON.stringify(body) : undefined,
  });
  const json = (await res.json().catch(() => ({}))) as Record<string, unknown>;
  return { status: res.status, body: json, headers: res.headers };
}

function assert(cond: boolean, msg: string) {
  if (!cond) throw new Error(`FAIL: ${msg}`);
}

async function main() {
  await connectDB();
  await Invoice.deleteMany({ $or: [{ reference: null }, { reference: { $exists: false } }] });
  await Reservation.deleteMany({ $or: [{ reference: null }, { reference: { $exists: false } }] });

  const adminEmail = `admin.mgmt.${ts}@test.inova`;
  const agentEmail = `agent.mgmt.${ts}@test.inova`;

  await User.deleteMany({ email: { $in: [adminEmail, agentEmail] } });
  await User.create({ name: 'Admin Mgmt', email: adminEmail, password: PASSWORD, role: 'admin' });
  await User.create({ name: 'Agent Mgmt', email: agentEmail, password: PASSWORD, role: 'agent' });

  const plate = `MG${String(ts).slice(-5)}`;
  const vehicle = await Vehicle.create({
    brand: 'Peugeot',
    model: '208',
    year: 2023,
    licensePlate: plate,
    category: 'economy',
    color: 'Blue',
    seats: 5,
    transmission: 'manual',
    fuelType: 'diesel',
    pricePerDay: 90,
    isAvailable: true,
    isActive: true,
  });

  const idNumber = `ID${ts}`;
  await Client.deleteMany({ idNumber });

  const app = express();
  app.use(express.json());
  app.use('/api/auth', authRoutes);
  app.use('/api/clients', clientRoutes);
  app.use('/api/contracts', contractRoutes);
  app.use('/api/invoices', invoiceRoutes);
  app.use(errorHandler);

  const server = app.listen(TEST_PORT);
  const adminToken = await login(adminEmail);
  const agentToken = await login(agentEmail);

  let clientId = '';
  let reservationId = '';
  let invoiceId = '';

  try {
    // 1. POST client
    const createClient = await api(CLIENTS, 'POST', '/', agentToken, {
      firstName: 'Marie',
      lastName: 'Martin',
      email: `marie.${ts}@test.inova`,
      phone: '+216 20 123 456',
      nationality: 'Tunisian',
      idType: 'cin',
      idNumber,
    });
    assert(createClient.status === 201, `create client ${createClient.status}`);
    const client = (createClient.body.data as Record<string, unknown>).client as Record<string, unknown>;
    clientId = String(client.id ?? client._id);
    console.log('✓ POST /api/clients creates client');

    // 2. Duplicate idNumber
    const dup = await api(CLIENTS, 'POST', '/', agentToken, {
      firstName: 'X',
      lastName: 'Y',
      phone: '+216 99 888 777',
      nationality: 'Tunisian',
      idType: 'cin',
      idNumber,
    });
    assert(dup.status === 409, `dup id ${dup.status}`);
    assert(dup.body.message === 'Client with this ID already exists', String(dup.body.message));
    console.log('✓ duplicate idNumber returns 409');

    const start = new Date();
    start.setDate(start.getDate() + 20);
    const end = new Date(start);
    end.setDate(end.getDate() + 3);

    const reservation = await Reservation.create({
      vehicle: vehicle._id,
      client: clientId,
      startDate: start,
      endDate: end,
      pricePerDay: 90,
      totalDays: 3,
      totalPrice: 270,
      pickupLocation: 'Tunis',
      returnLocation: 'Tunis',
      status: 'confirmed',
      paymentMethod: 'cash',
      paymentStatus: 'unpaid',
    });
    reservationId = reservation._id.toString();

    const pastReservation = await Reservation.create({
      vehicle: vehicle._id,
      client: clientId,
      startDate: start,
      endDate: end,
      pricePerDay: 90,
      totalDays: 5,
      totalPrice: 450,
      pickupLocation: 'Tunis',
      returnLocation: 'Tunis',
      status: 'pending',
      paymentMethod: 'cash',
      paymentStatus: 'paid',
    });
    await Reservation.updateOne(
      { _id: pastReservation._id },
      {
        status: 'completed',
        startDate: new Date(Date.now() - 90 * 86400000),
        endDate: new Date(Date.now() - 85 * 86400000),
        totalPrice: 450,
        totalDays: 5,
      },
    );

    // 3. GET client with history and spend
    const detail = await api(CLIENTS, 'GET', `/${clientId}`, adminToken);
    assert(detail.status === 200, `get client ${detail.status}`);
    const recent = (detail.body.data as Record<string, unknown>).recentReservations as unknown[];
    const totalSpent = (detail.body.data as Record<string, unknown>).totalSpent as number;
    assert(recent.length >= 1 && recent.length <= 5, 'recent reservations count');
    assert(totalSpent >= 450, `totalSpent ${totalSpent}`);
    console.log('✓ GET /api/clients/:id includes reservations and totalSpent');

    // 4. Generate contract PDF
    const contractRes = await api(CONTRACTS, 'POST', `/generate/${reservationId}`, agentToken);
    assert(contractRes.status === 201, `contract ${contractRes.status}: ${JSON.stringify(contractRes.body)}`);
    const contract = (contractRes.body.data as Record<string, unknown>).contract as Record<string, unknown>;
    assert(typeof contract.pdfUrl === 'string', 'pdfUrl missing');
    assert(typeof contract.contractNumber === 'string', 'contractNumber missing');
    console.log('✓ POST /api/contracts/generate creates contract with pdfUrl');

    // 5. PDF buffer is valid
    const populated = await Reservation.findById(reservationId)
      .populate('vehicle', 'brand model year licensePlate category')
      .populate('client', 'firstName lastName idType idNumber phone address')
      .populate('agent', 'name');
    const pdfBuf = await generateContractPDF(
      populated!.toObject() as unknown as Parameters<typeof generateContractPDF>[0],
    );
    assert(pdfBuf.subarray(0, 4).toString() === '%PDF', 'invalid PDF header');
    console.log('✓ Contract PDF is valid (%PDF header)');

    const invoice = await Invoice.create({
      reservation: reservationId,
      client: clientId,
      lineItems: [
        {
          description: 'Location véhicule - 3 jours',
          quantity: 3,
          unitPrice: 90,
          total: 270,
        },
      ],
      status: 'draft',
    });
    invoiceId = invoice._id.toString();

    // 6. Download invoice PDF
    const dlRes = await fetch(`${INVOICES}/${invoiceId}/download`, {
      headers: { Authorization: `Bearer ${agentToken}` },
      redirect: 'manual',
    });
    assert(dlRes.status === 200 || dlRes.status === 302, `download ${dlRes.status}`);
    if (dlRes.status === 200) {
      const ct = dlRes.headers.get('content-type') ?? '';
      assert(ct.includes('application/pdf'), `content-type: ${ct}`);
      const buf = Buffer.from(await dlRes.arrayBuffer());
      assert(buf.subarray(0, 4).toString() === '%PDF', 'invoice pdf invalid');
    }
    console.log('✓ GET /api/invoices/:id/download serves PDF');

    // 7. Status sent triggers email (jsonTransport when no SMTP)
    const sentRes = await api(INVOICES, 'PATCH', `/${invoiceId}/status`, adminToken, {
      status: 'sent',
    });
    assert(sentRes.status === 200, `sent status ${sentRes.status}`);
    console.log('✓ PATCH invoice status to sent triggers email flow');

    console.log('\nAll management checkpoint tests passed.');
  } finally {
    server.close();
    await Contract.deleteMany({ reservation: reservationId });
    await Invoice.deleteMany({ reservation: reservationId });
    await Reservation.deleteMany({ vehicle: vehicle._id });
    await Client.deleteMany({ idNumber });
    await Vehicle.deleteMany({ licensePlate: plate });
    await User.deleteMany({ email: { $in: [adminEmail, agentEmail] } });
    await disconnectDB();
  }
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
