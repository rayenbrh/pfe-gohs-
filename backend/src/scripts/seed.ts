/**
 * Seed default staff accounts — run: npm run seed
 *
 * Override via .env:
 *   SEED_SUPER_ADMIN_EMAIL, SEED_SUPER_ADMIN_PASSWORD
 *   SEED_ADMIN_EMAIL, SEED_ADMIN_PASSWORD
 *   SEED_AGENT_EMAIL, SEED_AGENT_PASSWORD
 */
import dotenv from 'dotenv';
import mongoose from 'mongoose';

import { connectDB, disconnectDB } from '../config/db';
import User from '../models/User';

dotenv.config();

const SEED_USERS = [
  {
    name: 'Super Admin',
    email: process.env.SEED_SUPER_ADMIN_EMAIL ?? 'admin@inovaride.com',
    password: process.env.SEED_SUPER_ADMIN_PASSWORD ?? 'Admin123!',
    role: 'super_admin' as const,
  },
  {
    name: 'Admin',
    email: process.env.SEED_ADMIN_EMAIL ?? 'manager@inovaride.com',
    password: process.env.SEED_ADMIN_PASSWORD ?? 'Admin123!',
    role: 'admin' as const,
  },
  {
    name: 'Agent',
    email: process.env.SEED_AGENT_EMAIL ?? 'agent@inovaride.com',
    password: process.env.SEED_AGENT_PASSWORD ?? 'Agent123!',
    role: 'agent' as const,
  },
];

async function seed(): Promise<void> {
  await connectDB();

  console.log('Seeding staff accounts...\n');

  for (const user of SEED_USERS) {
    const existing = await User.findOne({ email: user.email.toLowerCase() });
    if (existing) {
      console.log(`  skip  ${user.email} (${user.role}) — already exists`);
      continue;
    }

    await User.create(user);
    console.log(`  created ${user.email} (${user.role})`);
  }

  console.log('\nDefault login credentials (development):');
  console.log('  Super admin : admin@inovaride.com / Admin123!');
  console.log('  Admin       : manager@inovaride.com / Admin123!');
  console.log('  Agent       : agent@inovaride.com / Agent123!');

  mongoose.connection.removeAllListeners('disconnected');
  await disconnectDB();
}

seed().catch((err) => {
  console.error(err);
  process.exit(1);
});
