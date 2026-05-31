import type { FilterQuery } from 'mongoose';

import { getClientModel } from '../models/Client';
import { getReservationModel } from '../models/Reservation';
import type { IUserDocument } from '../types/models';
import { APIFeatures } from '../utils/apiFeatures';
import { AppError } from '../utils/AppError';

export async function assertUniqueIdNumber(
  idNumber: string,
  excludeClientId?: string,
): Promise<void> {
  const Client = getClientModel();
  const filter: FilterQuery<IUserDocument> = {
    role: 'client',
    idNumber: idNumber.trim(),
    isActive: { $ne: false },
  };
  if (excludeClientId) filter._id = { $ne: excludeClientId };

  const existing = await Client.findOne(filter).select('_id');
  if (existing) {
    throw new AppError('Client with this ID already exists', 409, 'CLIENT_ID_EXISTS');
  }
}

async function buildClientFilter(
  query: Record<string, string | undefined>,
): Promise<FilterQuery<IUserDocument>> {
  const filter: FilterQuery<IUserDocument> = { role: 'client', isActive: { $ne: false } };

  if (query.nationality) filter.nationality = query.nationality;
  if (query.isBlacklisted !== undefined) {
    filter.isBlacklisted = query.isBlacklisted === 'true';
  }
  if (query.idType) filter.idType = query.idType;

  if (query.search?.trim()) {
    const search = query.search.trim();
    filter.$or = [
      { firstName: { $regex: search, $options: 'i' } },
      { lastName: { $regex: search, $options: 'i' } },
      { phone: { $regex: search, $options: 'i' } },
      { idNumber: { $regex: search, $options: 'i' } },
    ];
  }

  return filter;
}

async function attachLatestReservations(clients: IUserDocument[]) {
  if (!clients.length) return clients;

  const Reservation = getReservationModel();
  const clientIds = clients.map((c) => c._id);
  const latest = await Reservation.aggregate([
    { $match: { client: { $in: clientIds } } },
    { $sort: { createdAt: -1 } },
    {
      $group: {
        _id: '$client',
        reservation: { $first: '$$ROOT' },
      },
    },
  ]);

  const map = new Map(latest.map((l) => [String(l._id), l.reservation]));

  return clients.map((client) => {
    const obj = client.toObject();
    return { ...obj, latestReservation: map.get(String(client._id)) ?? null };
  });
}

export async function listClients(query: Record<string, string | undefined>) {
  const Client = getClientModel();
  const filter = await buildClientFilter(query);
  const features = new APIFeatures(Client.find(filter), query).sort().limitFields().paginate();

  const clients = await features.query;
  const enriched = await attachLatestReservations(clients);
  const total = await features.paginationResult!.totalCountPromise;
  const limit = features.paginationResult!.limit;
  const skip = features.paginationResult!.skip;

  return {
    clients: enriched,
    results: enriched.length,
    total,
    totalPages: Math.ceil(total / limit) || 1,
    currentPage: Math.floor(skip / limit) + 1,
  };
}

export async function getClientById(id: string) {
  const Client = getClientModel();
  const Reservation = getReservationModel();
  const client = await Client.findOne({ _id: id, role: 'client', isActive: { $ne: false } });
  if (!client) throw new AppError('Client not found', 404, 'CLIENT_NOT_FOUND');

  const [recentReservations, spendAgg] = await Promise.all([
    Reservation.find({ client: id })
      .populate('vehicle', 'brand model licensePlate')
      .sort('-createdAt')
      .limit(5),
    Reservation.aggregate([
      { $match: { client: client._id, status: 'completed' } },
      { $group: { _id: null, totalSpent: { $sum: '$totalPrice' } } },
    ]),
  ]);

  const totalSpent = spendAgg[0]?.totalSpent ?? 0;

  return { client, recentReservations, totalSpent };
}

export async function createClient(data: Partial<IUserDocument>) {
  const Client = getClientModel();
  return Client.create({ ...data, role: 'client' });
}

export async function updateClient(id: string, data: Partial<IUserDocument>) {
  const Client = getClientModel();
  const client = await Client.findOneAndUpdate(
    { _id: id, role: 'client', isActive: { $ne: false } },
    data,
    { new: true, runValidators: true },
  );
  if (!client) throw new AppError('Client not found', 404, 'CLIENT_NOT_FOUND');
  return client;
}

export async function toggleBlacklist(
  id: string,
  isBlacklisted: boolean,
  reason?: string,
) {
  const Client = getClientModel();
  const client = await Client.findOne({ _id: id, role: 'client', isActive: { $ne: false } });
  if (!client) throw new AppError('Client not found', 404, 'CLIENT_NOT_FOUND');

  client.isBlacklisted = isBlacklisted;
  if (isBlacklisted && reason?.trim()) {
    const stamp = new Date().toISOString();
    const entry = `[${stamp}] BLACKLISTED: ${reason.trim()}`;
    client.notes = client.notes ? `${client.notes}\n${entry}` : entry;
  }

  await client.save();
  return client;
}

export async function getClientHistory(
  clientId: string,
  page: number,
  limit: number,
) {
  const Reservation = getReservationModel();
  const safePage = Math.max(1, page);
  const safeLimit = Math.min(100, Math.max(1, limit));
  const skip = (safePage - 1) * safeLimit;

  const filter = { client: clientId };
  const [reservations, total] = await Promise.all([
    Reservation.find(filter)
      .populate('vehicle', 'brand model licensePlate category')
      .sort('-createdAt')
      .skip(skip)
      .limit(safeLimit),
    Reservation.countDocuments(filter),
  ]);

  return {
    reservations,
    total,
    page: safePage,
    limit: safeLimit,
    totalPages: Math.ceil(total / safeLimit) || 1,
  };
}

export async function softDeleteClient(id: string) {
  const Client = getClientModel();
  const Reservation = getReservationModel();

  const activeReservation = await Reservation.findOne({
    client: id,
    status: { $in: ['pending', 'confirmed', 'active'] },
  }).select('_id');

  if (activeReservation) {
    throw new AppError(
      'Cannot delete client with active or confirmed reservations',
      409,
      'CLIENT_HAS_RESERVATIONS',
    );
  }

  const client = await Client.findByIdAndUpdate(id, { isActive: false }, { new: true });
  if (!client) throw new AppError('Client not found', 404, 'CLIENT_NOT_FOUND');
  return client;
}
