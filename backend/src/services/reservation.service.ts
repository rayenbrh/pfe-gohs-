import type { FilterQuery, Types } from 'mongoose';

import { getClientModel } from '../models/Client';
import { getContractModel } from '../models/Contract';
import { getInvoiceModel } from '../models/Invoice';
import { getReservationModel } from '../models/Reservation';
import { getVehicleModel } from '../models/Vehicle';
import { EmailService } from './email.service';
import {
  createCompletionInvoiceIfMissing,
  createDraftInvoiceForReservation,
  updateInvoiceWithExtraCharges,
} from './invoice.service';
import type { IReservationDocument } from '../types/models';
import { APIFeatures } from '../utils/apiFeatures';
import { AppError } from '../utils/AppError';
import { generateSequentialId } from '../utils/generateId';

const MS_PER_DAY = 1000 * 60 * 60 * 24;

export const STATUS_CALENDAR_COLORS: Record<string, string> = {
  pending: '#f59e0b',
  confirmed: '#3b82f6',
  active: '#10b981',
  completed: '#6b7280',
  cancelled: '#ef4444',
};

export interface CreateReservationData {
  vehicleId: string;
  clientId: string;
  startDate: Date;
  endDate: Date;
  pickupLocation: string;
  returnLocation: string;
  paymentMethod: 'cash' | 'card' | 'online';
  depositAmount?: number;
  notes?: string;
}

async function buildListFilter(
  query: Record<string, string | undefined>,
): Promise<FilterQuery<IReservationDocument>> {
  const filter: FilterQuery<IReservationDocument> = {};

  if (query.status) filter.status = query.status;
  if (query.paymentStatus) filter.paymentStatus = query.paymentStatus;
  if (query.vehicle) filter.vehicle = query.vehicle;
  if (query.client) filter.client = query.client;

  if (query.startDateFrom || query.startDateTo) {
    filter.startDate = {};
    if (query.startDateFrom) {
      (filter.startDate as Record<string, Date>).$gte = new Date(query.startDateFrom);
    }
    if (query.startDateTo) {
      (filter.startDate as Record<string, Date>).$lte = new Date(query.startDateTo);
    }
  }

  if (query.search?.trim()) {
    const Client = getClientModel();
    const search = query.search.trim();
    const matchingClients = await Client.find({
      role: 'client',
      $or: [
        { firstName: { $regex: search, $options: 'i' } },
        { lastName: { $regex: search, $options: 'i' } },
      ],
    }).select('_id');

    filter.$or = [
      { reservationNumber: { $regex: search, $options: 'i' } },
      { client: { $in: matchingClients.map((c) => c._id) } },
    ];
  }

  return filter;
}

export async function listReservations(query: Record<string, string | undefined>) {
  const Reservation = getReservationModel();
  const filter = await buildListFilter(query);
  const features = new APIFeatures(
    Reservation.find(filter)
      .populate('vehicle', 'brand model licensePlate')
      .populate('client', 'firstName lastName phone'),
    query,
  )
    .sort()
    .limitFields()
    .paginate();

  const reservations = await features.query;
  const total = await features.paginationResult!.totalCountPromise;
  const limit = features.paginationResult!.limit;
  const skip = features.paginationResult!.skip;
  const currentPage = Math.floor(skip / limit) + 1;
  const totalPages = Math.ceil(total / limit) || 1;

  return { reservations, results: reservations.length, total, totalPages, currentPage };
}

export async function getReservationById(id: string) {
  const Reservation = getReservationModel();
  const Contract = getContractModel();
  const Invoice = getInvoiceModel();

  const reservation = await Reservation.findById(id)
    .populate('vehicle')
    .populate('client')
    .populate('agent', 'name email');

  if (!reservation) {
    throw new AppError('Reservation not found', 404, 'RESERVATION_NOT_FOUND');
  }

  const [contract, invoice] = await Promise.all([
    Contract.findOne({ reservation: reservation._id }),
    Invoice.findOne({ reservation: reservation._id }),
  ]);

  return { reservation, contract, invoice };
}

export async function createReservation(data: CreateReservationData, agentId: string) {
  const Vehicle = getVehicleModel();
  const Client = getClientModel();
  const Reservation = getReservationModel();

  const startDate = new Date(data.startDate);
  const endDate = new Date(data.endDate);

  const [vehicle, client] = await Promise.all([
    Vehicle.findById(data.vehicleId),
    Client.findById(data.clientId),
  ]);

  if (!vehicle || vehicle.isActive === false) {
    throw new AppError('Vehicle not found', 404, 'VEHICLE_NOT_FOUND');
  }
  if (!client) {
    throw new AppError('Client not found', 404, 'CLIENT_NOT_FOUND');
  }
  if (client.isBlacklisted) {
    throw new AppError('Client is blacklisted', 403, 'CLIENT_BLACKLISTED');
  }
  if (!vehicle.isAvailable) {
    throw new AppError('Vehicle is not available', 400, 'VEHICLE_UNAVAILABLE');
  }

  const available = await Reservation.checkAvailability(data.vehicleId, startDate, endDate);
  if (!available) {
    throw new AppError('Vehicle not available for selected dates', 409, 'DATE_CONFLICT');
  }

  const pricePerDay = vehicle.pricePerDay;
  const totalDays = Math.max(1, Math.ceil((endDate.getTime() - startDate.getTime()) / MS_PER_DAY));
  const totalPrice = totalDays * pricePerDay;
  const reservationNumber = await generateSequentialId('RES');

  const reservation = await Reservation.create({
    reservationNumber,
    vehicle: data.vehicleId,
    client: data.clientId,
    agent: agentId,
    startDate,
    endDate,
    totalDays,
    pricePerDay,
    totalPrice,
    pickupLocation: data.pickupLocation,
    returnLocation: data.returnLocation,
    paymentMethod: data.paymentMethod,
    depositAmount: data.depositAmount,
    notes: data.notes,
    status: 'pending',
  });

  if (client.email) {
    await EmailService.sendReservationConfirmation(client.email, {
      clientName: `${client.firstName} ${client.lastName}`,
      reference: reservation.reservationNumber,
      vehicleName: `${vehicle.brand} ${vehicle.model}`,
      startDate,
      endDate,
    });
  }

  return reservation;
}

export async function completeReservation(
  reservationId: string,
  actualReturnDate?: Date,
  extraCharges = 0,
) {
  const Reservation = getReservationModel();
  const Client = getClientModel();
  const Vehicle = getVehicleModel();

  const reservation = await Reservation.findById(reservationId)
    .populate<{ vehicle: { brand: string; model: string; _id: unknown } }>('vehicle', 'brand model')
    .populate<{ client: { firstName: string; lastName: string; email?: string; _id: unknown } }>(
      'client',
      'firstName lastName email',
    );

  if (!reservation) {
    throw new AppError('Reservation not found', 404, 'RESERVATION_NOT_FOUND');
  }
  if (reservation.status !== 'active') {
    throw new AppError('Only active reservations can be completed', 400, 'INVALID_STATUS');
  }

  reservation.status = 'completed';
  reservation.actualReturnDate = actualReturnDate ?? new Date();
  reservation.extraCharges = extraCharges;

  await reservation.save();

  if (extraCharges > 0) {
    await updateInvoiceWithExtraCharges(reservationId, extraCharges);
  }

  await Client.findByIdAndUpdate(reservation.client, { $inc: { totalRentals: 1 } });
  await Vehicle.findByIdAndUpdate(reservation.vehicle, { isAvailable: true });

  const invoice = await createCompletionInvoiceIfMissing(
    reservation as unknown as IReservationDocument,
  );

  const clientDoc = reservation.populated('client')
    ? (reservation.client as { firstName: string; lastName: string; email?: string })
    : await Client.findById(reservation.client).select('firstName lastName email');
  const vehicleDoc = reservation.populated('vehicle')
    ? (reservation.vehicle as { brand: string; model: string })
    : await Vehicle.findById(reservation.vehicle).select('brand model');

  if (clientDoc?.email && vehicleDoc) {
    await EmailService.sendReservationCompletion(clientDoc.email, {
      clientName: `${clientDoc.firstName} ${clientDoc.lastName}`,
      reference: reservation.reservationNumber,
      vehicleName: `${vehicleDoc.brand} ${vehicleDoc.model}`,
      total: reservation.totalPrice + extraCharges,
    });
  }

  return { reservation, invoice };
}

export async function cancelReservation(
  reservationId: string,
  reason: string | undefined,
  cancelledBy: string,
) {
  const Reservation = getReservationModel();
  const Client = getClientModel();
  const Vehicle = getVehicleModel();

  const reservation = await Reservation.findById(reservationId).populate(
    'client',
    'firstName lastName email',
  );

  if (!reservation) {
    throw new AppError('Reservation not found', 404, 'RESERVATION_NOT_FOUND');
  }
  if (!['pending', 'confirmed'].includes(reservation.status)) {
    throw new AppError(
      'Only pending or confirmed reservations can be cancelled',
      400,
      'INVALID_STATUS',
    );
  }

  reservation.status = 'cancelled';
  reservation.cancellationReason = reason;
  reservation.cancelledAt = new Date();
  reservation.cancelledBy = cancelledBy as unknown as Types.ObjectId;

  if (reservation.paymentStatus === 'paid') {
    reservation.refundRequired = true;
  }

  await reservation.save();
  await Vehicle.findByIdAndUpdate(reservation.vehicle, { isAvailable: true });

  const clientDoc = reservation.populated('client')
    ? (reservation.client as unknown as { firstName: string; lastName: string; email?: string })
    : await Client.findById(reservation.client).select('firstName lastName email');

  if (clientDoc?.email) {
    await EmailService.sendReservationCancellation(clientDoc.email, {
      clientName: `${clientDoc.firstName} ${clientDoc.lastName}`,
      reference: reservation.reservationNumber,
      reason,
    });
  }

  return reservation;
}

export async function updateReservationFields(
  id: string,
  data: {
    pickupLocation?: string;
    returnLocation?: string;
    notes?: string;
    depositAmount?: number;
  },
) {
  const Reservation = getReservationModel();
  const reservation = await Reservation.findByIdAndUpdate(id, data, {
    new: true,
    runValidators: true,
  })
    .populate('vehicle', 'brand model licensePlate')
    .populate('client', 'firstName lastName phone');

  if (!reservation) {
    throw new AppError('Reservation not found', 404, 'RESERVATION_NOT_FOUND');
  }

  return reservation;
}

export async function getCalendarReservations(month: string) {
  const Reservation = getReservationModel();
  const [year, monthNum] = month.split('-').map(Number);
  const startOfMonth = new Date(year, monthNum - 1, 1);
  const endOfMonth = new Date(year, monthNum, 0, 23, 59, 59, 999);

  const reservations = await Reservation.find({
    startDate: { $lte: endOfMonth },
    endDate: { $gte: startOfMonth },
  })
    .populate('vehicle', 'brand model')
    .populate('client', 'firstName lastName')
    .sort('startDate');

  return reservations.map((r) => {
    const vehicle = r.vehicle as unknown as { _id: unknown; brand: string; model: string };
    const client = r.client as unknown as { firstName: string; lastName: string };

    return {
      reservationId: r._id,
      vehicleId: vehicle._id,
      vehicleName: `${vehicle.brand} ${vehicle.model}`,
      clientName: `${client.firstName} ${client.lastName}`,
      startDate: r.startDate,
      endDate: r.endDate,
      status: r.status,
      color: STATUS_CALENDAR_COLORS[r.status] ?? '#6b7280',
    };
  });
}

export async function hardDeleteReservation(id: string) {
  const Reservation = getReservationModel();
  const reservation = await Reservation.findById(id);
  if (!reservation) {
    throw new AppError('Reservation not found', 404, 'RESERVATION_NOT_FOUND');
  }
  if (reservation.status !== 'cancelled') {
    throw new AppError('Only cancelled reservations can be deleted', 400, 'INVALID_STATUS');
  }

  await Reservation.findByIdAndDelete(id);
  return reservation;
}

export async function transitionToConfirmed(id: string) {
  const Reservation = getReservationModel();
  const reservation = await Reservation.findById(id);
  if (!reservation) throw new AppError('Reservation not found', 404, 'RESERVATION_NOT_FOUND');
  if (reservation.status !== 'pending') {
    throw new AppError('Only pending reservations can be confirmed', 400, 'INVALID_STATUS');
  }
  reservation.status = 'confirmed';
  await reservation.save();
  return reservation;
}

export async function transitionToActive(id: string) {
  const Reservation = getReservationModel();
  const Vehicle = getVehicleModel();
  const reservation = await Reservation.findById(id);
  if (!reservation) throw new AppError('Reservation not found', 404, 'RESERVATION_NOT_FOUND');
  if (reservation.status !== 'confirmed') {
    throw new AppError('Only confirmed reservations can be activated', 400, 'INVALID_STATUS');
  }
  reservation.status = 'active';
  await reservation.save();
  await Vehicle.findByIdAndUpdate(reservation.vehicle, { isAvailable: false });
  return reservation;
}

/** @deprecated Use exported functions */
export class ReservationService {
  static listReservations = listReservations;
  static getById = getReservationById;
  static create = createReservation;
  static cancel = cancelReservation;
}
