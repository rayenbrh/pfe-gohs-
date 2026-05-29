/**
 * Upload & security checkpoint — run: npm run test:upload-security
 */
import 'express-async-errors';

import express from 'express';
import dotenv from 'dotenv';
import { readFileSync } from 'fs';
import { join } from 'path';
import mongoose from 'mongoose';

import { configureCloudinary, isCloudinaryConfigured } from '../config/cloudinary';
import { connectDB, disconnectDB } from '../config/db';
import User from '../models/User';
import Vehicle from '../models/Vehicle';
import { errorHandler } from '../middleware/error.middleware';
import { capListLimit, requestContext } from '../middleware/request.middleware';
import authRoutes from '../routes/auth.routes';
import uploadRoutes from '../routes/upload.routes';

dotenv.config();

const TEST_PORT = 5104;
const AUTH = `http://127.0.0.1:${TEST_PORT}/api/auth`;
const UPLOADS = `http://127.0.0.1:${TEST_PORT}/api/uploads`;

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
  description: 'Upload test vehicle',
  isAvailable: true,
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

function assert(cond: boolean, msg: string) {
  if (!cond) throw new Error(`FAIL: ${msg}`);
}

function tinyPngBuffer(): Buffer {
  return Buffer.from(
    'iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mP8z8BQDwAEhQGAhKmMIQAAAABJRU5ErkJggg==',
    'base64',
  );
}

async function main() {
  await connectDB();
  configureCloudinary();

  const adminEmail = `admin.upload.${ts}@test.inova`;
  await User.deleteMany({ email: adminEmail });
  await User.create({ name: 'Admin Upload', email: adminEmail, password: PASSWORD, role: 'admin' });

  const plate = `UP${String(ts).slice(-5)}`;
  const vehicle = await Vehicle.create(sampleVehicle(plate));

  const app = express();
  app.use(requestContext);
  app.use(express.json());
  app.use('/api', capListLimit);
  app.use('/api/auth', authRoutes);
  app.use('/api/uploads', uploadRoutes);
  app.use(errorHandler);

  const server = app.listen(TEST_PORT);

  try {
    const token = await login(adminEmail);
    assert(!!token, 'login failed');

    const listRes = await fetch(`${AUTH}/users?limit=999`, {
      headers: { Authorization: `Bearer ${token}` },
    });
    const listJson = (await listRes.json()) as Record<string, unknown>;
    const meta = listJson.meta as Record<string, number>;
    assert(meta.limit <= 100, `limit=999 not capped, got ${meta.limit}`);
    console.log('✓ limit=999 capped to 100');

    if (isCloudinaryConfigured()) {
      const form = new FormData();
      const blob = new Blob([tinyPngBuffer()], { type: 'image/png' });
      form.append('images', blob, 'test.png');

      const uploadRes = await fetch(`${UPLOADS}/vehicle/${vehicle._id}/images`, {
        method: 'POST',
        headers: { Authorization: `Bearer ${token}` },
        body: form,
      });
      assert(uploadRes.status === 201, `upload expected 201, got ${uploadRes.status}`);
      const uploadJson = (await uploadRes.json()) as Record<string, unknown>;
      const images = (uploadJson.data as Record<string, unknown>).images as string[];
      assert(Array.isArray(images) && images.length >= 1, 'no Cloudinary URLs returned');
      assert(images[0].includes('cloudinary.com'), 'URL is not a Cloudinary URL');
      console.log('✓ Vehicle image upload returns Cloudinary URL');
    } else {
      console.log('⚠ Cloudinary not configured — skipping live upload test');
    }

    const bigForm = new FormData();
    const bigBlob = new Blob([Buffer.alloc(6 * 1024 * 1024)], { type: 'image/png' });
    bigForm.append('images', bigBlob, 'big.png');

    const tooBigRes = await fetch(`${UPLOADS}/vehicle/${vehicle._id}/images`, {
      method: 'POST',
      headers: { Authorization: `Bearer ${token}` },
      body: bigForm,
    });
    assert(tooBigRes.status === 413, `6MB upload expected 413, got ${tooBigRes.status}`);
    const tooBigJson = (await tooBigRes.json()) as Record<string, unknown>;
    assert(String(tooBigJson.message).includes('File too large'), '413 message incorrect');
    console.log('✓ 6MB image returns 413 File too large');

    const swaggerPath = join(process.cwd(), 'src', 'config', 'swagger.ts');
    const swaggerSource = readFileSync(swaggerPath, 'utf-8');
    assert(swaggerSource.includes('bearerAuth'), 'swagger missing bearerAuth');
    assert(swaggerSource.includes('Vehicle'), 'swagger missing Vehicle schema');
    console.log('✓ Swagger config includes schemas and bearer auth');

    console.log('PASS: upload-security checkpoint');
  } finally {
    await Vehicle.findByIdAndDelete(vehicle._id);
    await User.deleteMany({ email: adminEmail });
    server.close();
    mongoose.connection.removeAllListeners('disconnected');
    await disconnectDB();
    process.exit(0);
  }
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
