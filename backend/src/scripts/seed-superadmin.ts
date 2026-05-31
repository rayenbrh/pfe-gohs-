/**
 * Creates the initial Super Admin account.
 * Run once: npx ts-node src/scripts/seed-superadmin.ts
 */
import dotenv from 'dotenv';
dotenv.config();

import mongoose from 'mongoose';
import SuperAdmin from '../models/SuperAdmin';

async function main() {
  const uri = process.env.MASTER_MONGODB_URI ?? process.env.MONGODB_URI;
  if (!uri) throw new Error('MASTER_MONGODB_URI not set');

  await mongoose.connect(uri);
  console.log('Connected to master DB');

  const email = process.env.SA_EMAIL ?? 'superadmin@inovaride.com';
  const password = process.env.SA_PASSWORD ?? 'SuperAdmin123!';
  const name = process.env.SA_NAME ?? 'Super Admin';

  const existing = await SuperAdmin.findOne({ email });
  if (existing) {
    console.log(`Super admin already exists: ${email}`);
    await mongoose.disconnect();
    return;
  }

  await SuperAdmin.create({ name, email, password });
  console.log(`Super admin created: ${email}`);
  await mongoose.disconnect();
}

main().catch(console.error);
