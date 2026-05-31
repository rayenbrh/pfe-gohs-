import type { Request, Response } from 'express';

import logger from '../config/logger';
import { getAgencyConnection } from '../config/tenantDB';
import Agency from '../models/Agency';
import SuperAdmin from '../models/SuperAdmin';
import { getUserModel } from '../models/User';
import { AppError } from '../utils/AppError';
import { catchAsync } from '../utils/catchAsync';
import { generateAccessToken, generateRefreshToken } from '../utils/generateToken';

// ─── Auth ─────────────────────────────────────────────────────────────────────

export const login = catchAsync(async (req: Request, res: Response) => {
  const { email, password } = req.body as { email: string; password: string };
  const admin = await SuperAdmin.findByEmail(email);

  if (!admin || !(await admin.comparePassword(password))) {
    throw new AppError('Invalid credentials', 401, 'INVALID_CREDENTIALS');
  }
  if (!admin.isActive) {
    throw new AppError('Account deactivated', 403, 'ACCOUNT_DEACTIVATED');
  }

  admin.lastLogin = new Date();
  await admin.save({ validateBeforeSave: false });

  const accessToken = generateAccessToken({ _id: admin._id.toString(), role: 'super_admin' });
  const refreshToken = generateRefreshToken({ _id: admin._id.toString() });

  logger.info('SuperAdmin logged in', { email: admin.email, ip: req.ip });

  res.status(200).json({
    status: 'success',
    data: {
      user: { id: admin._id, name: admin.name, email: admin.email, role: 'super_admin' },
      accessToken,
      refreshToken,
    },
  });
});

export const me = catchAsync(async (req: Request, res: Response) => {
  res.status(200).json({
    status: 'success',
    data: { user: req.user },
  });
});

// ─── Agencies ─────────────────────────────────────────────────────────────────

export const listAgencies = catchAsync(async (_req: Request, res: Response) => {
  const agencies = await Agency.find().sort('-createdAt');
  res.status(200).json({
    status: 'success',
    results: agencies.length,
    data: { agencies },
  });
});

export const getAgency = catchAsync(async (req: Request, res: Response) => {
  const agency = await Agency.findById(req.params.id);
  if (!agency) throw new AppError('Agency not found', 404, 'AGENCY_NOT_FOUND');
  res.status(200).json({ status: 'success', data: { agency } });
});

export const createAgency = catchAsync(async (req: Request, res: Response) => {
  const {
    name,
    address,
    phone,
    logo,
    adminName,
    adminEmail,
    adminPassword,
  } = req.body as {
    name: string;
    address: string;
    phone: string;
    logo?: string;
    adminName: string;
    adminEmail: string;
    adminPassword: string;
  };

  const slug = name.toLowerCase().trim().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '');
  const dbName = `agency_${slug.replace(/-/g, '_')}`;

  const existing = await Agency.findOne({ $or: [{ slug }, { dbName }] });
  if (existing) {
    throw new AppError('An agency with this name already exists', 409, 'AGENCY_EXISTS');
  }

  const agency = await Agency.create({ name, slug, dbName, address, phone, logo });

  // Provision the agency database and create the first admin user
  const conn = await getAgencyConnection(dbName);
  const User = getUserModel(conn);

  const existingAdmin = await User.findOne({ email: adminEmail.toLowerCase() });
  if (existingAdmin) {
    await agency.deleteOne();
    throw new AppError('An account with this email already exists', 409, 'EMAIL_EXISTS');
  }

  await User.create({
    name: adminName,
    email: adminEmail,
    password: adminPassword,
    role: 'admin',
    isActive: true,
  });

  logger.info('Agency created', { slug, dbName, adminEmail });

  res.status(201).json({
    status: 'success',
    data: { agency },
  });
});

export const updateAgency = catchAsync(async (req: Request, res: Response) => {
  const { name, address, phone, logo, isActive } = req.body;
  const agency = await Agency.findByIdAndUpdate(
    req.params.id,
    { name, address, phone, logo, isActive },
    { new: true, runValidators: true },
  );
  if (!agency) throw new AppError('Agency not found', 404, 'AGENCY_NOT_FOUND');
  res.status(200).json({ status: 'success', data: { agency } });
});

export const deleteAgency = catchAsync(async (req: Request, res: Response) => {
  const agency = await Agency.findByIdAndUpdate(
    req.params.id,
    { isActive: false },
    { new: true },
  );
  if (!agency) throw new AppError('Agency not found', 404, 'AGENCY_NOT_FOUND');
  res.status(200).json({ status: 'success', data: { agency } });
});

// ─── Global stats (aggregated across all agencies) ───────────────────────────

export const getGlobalStats = catchAsync(async (_req: Request, res: Response) => {
  const [totalAgencies, activeAgencies] = await Promise.all([
    Agency.countDocuments(),
    Agency.countDocuments({ isActive: true }),
  ]);

  // Per-agency user/reservation stats via their individual DBs
  const agencies = await Agency.find({ isActive: true }).select('dbName name slug');
  let totalUsers = 0;
  let totalClients = 0;
  let totalEmployees = 0;
  let totalAdmins = 0;

  await Promise.all(
    agencies.map(async (ag) => {
      try {
        const conn = await getAgencyConnection(ag.dbName);
        const User = getUserModel(conn);
        const [admins, employees, clients] = await Promise.all([
          User.countDocuments({ role: 'admin' }),
          User.countDocuments({ role: 'employee' }),
          User.countDocuments({ role: 'client' }),
        ]);
        totalAdmins += admins;
        totalEmployees += employees;
        totalClients += clients;
        totalUsers += admins + employees + clients;
      } catch {
        // Skip agencies whose DB is unreachable
      }
    }),
  );

  res.status(200).json({
    status: 'success',
    data: {
      agencies: { total: totalAgencies, active: activeAgencies },
      users: { total: totalUsers, admins: totalAdmins, employees: totalEmployees, clients: totalClients },
    },
  });
});

// ─── Accounts (super admin management) ───────────────────────────────────────

export const listAccounts = catchAsync(async (_req: Request, res: Response) => {
  const admins = await SuperAdmin.find().select('-password -__v');
  res.status(200).json({
    status: 'success',
    results: admins.length,
    data: { accounts: admins },
  });
});

export const createAccount = catchAsync(async (req: Request, res: Response) => {
  const { name, email, password } = req.body;
  const existing = await SuperAdmin.findOne({ email });
  if (existing) throw new AppError('Email already in use', 409, 'EMAIL_EXISTS');
  const admin = await SuperAdmin.create({ name, email, password });
  res.status(201).json({
    status: 'success',
    data: { account: { id: admin._id, name: admin.name, email: admin.email } },
  });
});

export const toggleAccountStatus = catchAsync(async (req: Request, res: Response) => {
  const account = await SuperAdmin.findByIdAndUpdate(
    req.params.id,
    { isActive: req.body.isActive },
    { new: true },
  ).select('-password');
  if (!account) throw new AppError('Account not found', 404, 'NOT_FOUND');
  res.status(200).json({ status: 'success', data: { account } });
});
