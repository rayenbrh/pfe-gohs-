/**
 * Model import smoke test + concurrent sequential ID generation test.
 * Run: npx tsx src/models/models.test.ts
 */
import dotenv from 'dotenv';
import mongoose from 'mongoose';

dotenv.config();

import {
  Client,
  Contract,
  Counter,
  Invoice,
  MaintenanceLog,
  Reservation,
  User,
  Vehicle,
} from './index';
import { connectDB, disconnectDB } from '../config/db';
import { generateSequentialId } from '../utils/generateId';

async function assertModelImports(): Promise<void> {
  const models = [User, Vehicle, Client, Reservation, Contract, Invoice, MaintenanceLog, Counter];
  console.log(`✓ Imported ${models.length} models without circular dependency errors`);
}

async function assertUniqueSequentialIds(): Promise<void> {
  const testCounterId = `TEST-${new Date().getFullYear()}`;
  await Counter.findByIdAndDelete(testCounterId);

  const ids = await Promise.all(
    Array.from({ length: 10 }, () => generateSequentialId('RES')),
  );

  const unique = new Set(ids);
  if (unique.size !== ids.length) {
    throw new Error(`Duplicate IDs generated: ${ids.join(', ')}`);
  }

  console.log('✓ generateSequentialId produced 10 unique IDs under parallel calls');
  console.log('  Sample IDs:', ids.slice(0, 3).join(', '), '...');
}

async function assertToJsonTransform(): Promise<void> {
  const json = new User({
    name: 'Test User',
    email: `test-${Date.now()}@example.com`,
    password: 'password123',
    role: 'agent',
  }).toJSON();

  if (json._id !== undefined || json.__v !== undefined) {
    throw new Error('toJSON transform failed to remove _id/__v');
  }
  if (!json.id) {
    throw new Error('toJSON transform failed to expose id');
  }
  if (json.password !== undefined) {
    throw new Error('toJSON transform failed to remove password');
  }

  console.log('✓ User toJSON transform: _id → id, password removed');
}

async function main(): Promise<void> {
  await assertModelImports();

  if (process.env.MONGODB_URI) {
    await connectDB();
    await assertUniqueSequentialIds();
    await assertToJsonTransform();
    await disconnectDB();
  } else {
    console.log('⚠ MONGODB_URI not set — skipping DB integration checks');
  }

  console.log('\nAll model tests passed.');
}

main().catch((error) => {
  console.error('Model tests failed:', error);
  process.exit(1);
});
