/**
 * Konnect payment checkpoint tests — run: npm run test:payments
 * Uses mocked Konnect API when KONNECT_API_KEY is not set.
 */
import 'express-async-errors';

import express from 'express';
import dotenv from 'dotenv';

import { connectDB, disconnectDB } from '../config/db';
import Client from '../models/Client';
import Invoice from '../models/Invoice';
import Reservation from '../models/Reservation';
import Vehicle from '../models/Vehicle';
import { errorHandler } from '../middleware/error.middleware';
import paymentRoutes from '../routes/payment.routes';
import { reservationConfirmationEmail } from '../utils/emailTemplates';
import { sendEmail } from '../utils/sendEmail';

dotenv.config();

const TEST_PORT = 5103;
const BASE = `http://127.0.0.1:${TEST_PORT}/api/payments`;
const ts = Date.now();

const originalFetch = global.fetch;

function mockKonnectFetch() {
  global.fetch = (async (input: string | URL, init?: RequestInit) => {
    const url = String(input);

    if (!url.includes('konnect.network')) {
      return originalFetch(input, init);
    }

    if (url.includes('/init-payment') && init?.method === 'POST') {
      return new Response(
        JSON.stringify({
          payUrl: `https://gateway.konnect.network/pay?ref=MOCK-${ts}`,
          paymentRef: `MOCK-PAY-${ts}`,
        }),
        { status: 200, headers: { 'Content-Type': 'application/json' } },
      );
    }

    if (url.match(/\/payments\/[^/]+$/)) {
      const ref = url.split('/').pop()!;
      const status = ref.includes('FAIL') ? 'cancelled' : 'paid';
      return new Response(
        JSON.stringify({ payment: { status, amount: 270000, paymentRef: ref } }),
        { status: 200, headers: { 'Content-Type': 'application/json' } },
      );
    }

    return originalFetch(input, init);
  }) as typeof fetch;
}

async function request(
  method: string,
  path: string,
  body?: Record<string, unknown>,
): Promise<{ status: number; body: Record<string, unknown> }> {
  const res = await fetch(`${BASE}${path}`, {
    method,
    headers: { 'Content-Type': 'application/json' },
    body: body ? JSON.stringify(body) : undefined,
  });
  const json = (await res.json().catch(() => ({}))) as Record<string, unknown>;
  return { status: res.status, body: json };
}

function assert(cond: boolean, msg: string) {
  if (!cond) throw new Error(`FAIL: ${msg}`);
}

async function main() {
  process.env.KONNECT_API_KEY = process.env.KONNECT_API_KEY || 'test-konnect-key';
  process.env.KONNECT_WALLET_ID = process.env.KONNECT_WALLET_ID || 'test-wallet-id';
  process.env.API_URL = `http://127.0.0.1:${TEST_PORT}`;
  process.env.FRONTEND_URL = 'http://localhost:3000';

  mockKonnectFetch();
  await connectDB();

  const plate = `KP${String(ts).slice(-5)}`;
  const client = await Client.create({
    firstName: 'Karim',
    lastName: 'Benali',
    email: `karim.pay.${ts}@test.inova`,
    phone: '+21620123456',
    nationality: 'Tunisian',
    idType: 'cin',
    idNumber: `PAY${ts}`,
  });

  const vehicle = await Vehicle.create({
    brand: 'Renault',
    model: 'Clio',
    year: 2023,
    licensePlate: plate,
    category: 'economy',
    color: 'Grey',
    seats: 5,
    transmission: 'manual',
    fuelType: 'diesel',
    pricePerDay: 90,
    isAvailable: true,
    isActive: true,
  });

  const start = new Date();
  start.setDate(start.getDate() + 10);
  const end = new Date(start);
  end.setDate(end.getDate() + 3);

  const reservation = await Reservation.create({
    vehicle: vehicle._id,
    client: client._id,
    startDate: start,
    endDate: end,
    pricePerDay: 90,
    totalDays: 3,
    totalPrice: 270,
    pickupLocation: 'Tunis Airport',
    returnLocation: 'Tunis Airport',
    status: 'pending',
    paymentMethod: 'online',
    paymentStatus: 'unpaid',
  });

  await Invoice.create({
    reservation: reservation._id,
    client: client._id,
    lineItems: [
      { description: 'Location 3 jours', quantity: 3, unitPrice: 90, total: 270 },
    ],
    status: 'draft',
  });

  const app = express();
  app.use(express.json());
  app.use('/api/payments', paymentRoutes);
  app.use(errorHandler);

  const server = app.listen(TEST_PORT);
  await new Promise<void>((resolve) => server.on('listening', () => resolve()));

  try {
    // 1. POST /init returns payUrl
    const initRes = await request('POST', '/init', { reservationId: reservation._id.toString() });
    assert(initRes.status === 200, `init ${initRes.status}: ${JSON.stringify(initRes.body)}`);
    const payUrl = (initRes.body.data as Record<string, unknown>).payUrl as string;
    const paymentRef = (initRes.body.data as Record<string, unknown>).paymentRef as string;
    assert(typeof payUrl === 'string' && payUrl.includes('konnect'), `payUrl: ${payUrl}`);
    console.log('✓ POST /api/payments/init returns payUrl');

    // 2. Amount in millimes (270 TND = 270000)
    const updated = await Reservation.findById(reservation._id);
    assert(updated?.konnectPaymentRef === paymentRef, 'konnectPaymentRef not saved');
    console.log('✓ konnectPaymentRef saved on reservation');

    // 3. Webhook processing
    const webhookRes = await request('POST', '/webhook', {
      payment_ref: paymentRef,
      payment_status: 'paid',
    });
    assert(webhookRes.status === 200, `webhook ${webhookRes.status}`);

    const afterWebhook = await Reservation.findById(reservation._id);
    const afterInvoice = await Invoice.findOne({ reservation: reservation._id });
    assert(afterWebhook?.status === 'confirmed', `status ${afterWebhook?.status}`);
    assert(afterWebhook?.paymentStatus === 'paid', `paymentStatus ${afterWebhook?.paymentStatus}`);
    assert(afterInvoice?.status === 'paid', `invoice ${afterInvoice?.status}`);
    console.log('✓ Webhook confirms reservation and invoice');

    // 4. GET verify
    const verifyRes = await request('GET', `/verify/${paymentRef}`);
    assert(verifyRes.status === 200, `verify ${verifyRes.status}`);
    const verifyData = verifyRes.body.data as Record<string, unknown>;
    assert(verifyData.paymentStatus === 'paid', `verify status ${verifyData.paymentStatus}`);
    console.log('✓ GET /api/payments/verify/:paymentRef');

    // 5. Email templates + sendEmail (non-throwing)
    const tpl = reservationConfirmationEmail(
      {
        reservationNumber: 'RES-2026-0001',
        vehicleName: 'Renault Clio',
        startDate: start,
        endDate: end,
        totalPrice: 270,
        pickupLocation: 'Tunis',
        returnLocation: 'Tunis',
      },
      { firstName: 'Karim', lastName: 'Benali', email: client.email },
    );
    assert(tpl.html.includes('INova RIDE') && tpl.text.length > 0, 'email template invalid');
    const emailResult = await sendEmail({
      to: client.email!,
      subject: tpl.subject,
      html: tpl.html,
      text: tpl.text,
    });
    assert(emailResult.success === true, 'email send failed');
    console.log('✓ Transactional emails send without throwing');

    console.log('\nAll payment checkpoint tests passed.');
  } finally {
    server.close();
    global.fetch = originalFetch;
    await Invoice.deleteMany({ reservation: reservation._id });
    await Reservation.deleteMany({ _id: reservation._id });
    await Client.deleteMany({ idNumber: `PAY${ts}` });
    await Vehicle.deleteMany({ licensePlate: plate });
    await disconnectDB();
  }
}

main().catch((err) => {
  console.error(err);
  global.fetch = originalFetch;
  process.exit(1);
});
