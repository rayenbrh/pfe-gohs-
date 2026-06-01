import type { FilterQuery, Types } from 'mongoose';

import { getMaintenanceLogModel } from '../models/MaintenanceLog';
import { getReservationModel } from '../models/Reservation';
import { getVehicleModel } from '../models/Vehicle';
import type { IVehicleDocument } from '../types/models';
import { APIFeatures } from '../utils/apiFeatures';
import { AppError } from '../utils/AppError';

export interface VehicleListFilters {
  category?: string;
  fuelType?: string;
  transmission?: string;
  brand?: string;
  isAvailable?: boolean;
  minSeats?: number;
  maxSeats?: number;
  minPrice?: number;
  maxPrice?: number;
  search?: string;
}

function buildListFilter(query: Record<string, string | undefined>): FilterQuery<IVehicleDocument> {
  const filter: FilterQuery<IVehicleDocument> = {
    isActive: { $ne: false },
  };

  if (query.all === 'true') {
    // Fleet catalogue — all active vehicles (available + rented/maintenance)
  } else if (query.isAvailable !== undefined) {
    filter.isAvailable = query.isAvailable === 'true';
  } else {
    filter.isAvailable = true;
  }

  if (query.category) filter.category = query.category;
  if (query.fuelType) filter.fuelType = query.fuelType;
  if (query.transmission) filter.transmission = query.transmission;
  if (query.brand) filter.brand = new RegExp(query.brand, 'i');

  const minSeats = query.minSeats ?? query.seatsMin;
  const maxSeats = query.maxSeats ?? query.seatsMax;
  if (minSeats || maxSeats) {
    filter.seats = {};
    if (minSeats) (filter.seats as Record<string, number>).$gte = Number(minSeats);
    if (maxSeats) (filter.seats as Record<string, number>).$lte = Number(maxSeats);
  }

  const minPrice = query.minPrice ?? query.pricePerDayMin;
  const maxPrice = query.maxPrice ?? query.pricePerDayMax;
  if (minPrice || maxPrice) {
    filter.pricePerDay = {};
    if (minPrice) (filter.pricePerDay as Record<string, number>).$gte = Number(minPrice);
    if (maxPrice) (filter.pricePerDay as Record<string, number>).$lte = Number(maxPrice);
  }

  if (query.search?.trim()) {
    filter.$text = { $search: query.search.trim() };
  }

  return filter;
}

export async function listVehicles(query: Record<string, string | undefined>) {
  const Vehicle = getVehicleModel();
  const filter = buildListFilter(query);
  const features = new APIFeatures(Vehicle.find(filter), query).sort().limitFields().paginate();

  const vehicles = await features.query;
  const total = await features.paginationResult!.totalCountPromise;
  const limit = features.paginationResult!.limit;
  const skip = features.paginationResult!.skip;
  const currentPage = Math.floor(skip / limit) + 1;
  const totalPages = Math.ceil(total / limit) || 1;

  return { vehicles, results: vehicles.length, total, totalPages, currentPage };
}

export async function getVehicleById(id: string) {
  const Vehicle = getVehicleModel();
  const vehicle = await Vehicle.findOne({ _id: id, isActive: { $ne: false } }).populate(
    'addedBy',
    'name',
  );
  if (!vehicle) {
    throw new AppError('Vehicle not found', 404, 'VEHICLE_NOT_FOUND');
  }
  return vehicle;
}

export async function getAvailableVehicles(
  startDate: Date,
  endDate: Date,
  filters: VehicleListFilters = {},
) {
  if (startDate >= endDate) {
    throw new AppError('startDate must be before endDate', 400, 'INVALID_DATE_RANGE');
  }

  const Vehicle = getVehicleModel();
  const Reservation = getReservationModel();

  const overlapping = await Reservation.find({
    status: { $in: ['pending', 'confirmed', 'active'] },
    startDate: { $lte: endDate },
    endDate: { $gte: startDate },
  }).distinct('vehicle');

  const vehicleFilter: FilterQuery<IVehicleDocument> = {
    _id: { $nin: overlapping },
    isAvailable: true,
    isActive: { $ne: false },
  };

  if (filters.category) vehicleFilter.category = filters.category;
  if (filters.fuelType) vehicleFilter.fuelType = filters.fuelType;
  if (filters.transmission) vehicleFilter.transmission = filters.transmission;
  if (filters.brand) vehicleFilter.brand = new RegExp(filters.brand, 'i');
  if (filters.isAvailable !== undefined) vehicleFilter.isAvailable = filters.isAvailable;
  if (filters.minSeats || filters.maxSeats) {
    vehicleFilter.seats = {};
    if (filters.minSeats) (vehicleFilter.seats as Record<string, number>).$gte = filters.minSeats;
    if (filters.maxSeats) (vehicleFilter.seats as Record<string, number>).$lte = filters.maxSeats;
  }
  if (filters.minPrice || filters.maxPrice) {
    vehicleFilter.pricePerDay = {};
    if (filters.minPrice) {
      (vehicleFilter.pricePerDay as Record<string, number>).$gte = filters.minPrice;
    }
    if (filters.maxPrice) {
      (vehicleFilter.pricePerDay as Record<string, number>).$lte = filters.maxPrice;
    }
  }
  if (filters.search?.trim()) {
    vehicleFilter.$text = { $search: filters.search.trim() };
  }

  return Vehicle.find(vehicleFilter).sort('-createdAt');
}

export async function checkVehicleConflict(
  vehicleId: Types.ObjectId | string,
  startDate: Date,
  endDate: Date,
  excludeReservationId?: Types.ObjectId | string,
): Promise<boolean> {
  const Reservation = getReservationModel();
  const available = await Reservation.checkAvailability(
    vehicleId,
    startDate,
    endDate,
    excludeReservationId,
  );
  return !available;
}

export async function assertUniqueLicensePlate(
  licensePlate: string,
  excludeVehicleId?: string,
): Promise<void> {
  const Vehicle = getVehicleModel();
  const filter: FilterQuery<IVehicleDocument> = {
    licensePlate: licensePlate.toUpperCase(),
    isActive: { $ne: false },
  };
  if (excludeVehicleId) {
    filter._id = { $ne: excludeVehicleId };
  }

  const existing = await Vehicle.findOne(filter).select('_id');
  if (existing) {
    throw new AppError('License plate already in use', 409, 'LICENSE_PLATE_EXISTS');
  }
}

export async function createVehicle(
  data: Partial<IVehicleDocument> & { addedBy?: Types.ObjectId | string },
) {
  const Vehicle = getVehicleModel();
  return Vehicle.create({
    ...data,
    images: data.images ?? [],
    features: data.features ?? [],
  });
}

export async function updateVehicle(id: string, data: Partial<IVehicleDocument>) {
  const Vehicle = getVehicleModel();
  const vehicle = await Vehicle.findOneAndUpdate(
    { _id: id, isActive: { $ne: false } },
    data,
    { new: true, runValidators: true },
  );
  if (!vehicle) {
    throw new AppError('Vehicle not found', 404, 'VEHICLE_NOT_FOUND');
  }
  return vehicle;
}

export async function softDeleteVehicle(id: string) {
  const Vehicle = getVehicleModel();
  const Reservation = getReservationModel();

  const activeReservation = await Reservation.findOne({
    vehicle: id,
    status: { $in: ['pending', 'confirmed', 'active'] },
  }).select('_id');

  if (activeReservation) {
    throw new AppError(
      'Cannot delete a vehicle with active reservations',
      409,
      'VEHICLE_HAS_RESERVATIONS',
    );
  }

  const vehicle = await Vehicle.findByIdAndUpdate(
    id,
    { isActive: false, isAvailable: false },
    { new: true },
  );

  if (!vehicle) {
    throw new AppError('Vehicle not found', 404, 'VEHICLE_NOT_FOUND');
  }

  return vehicle;
}

export async function updateVehicleAvailability(
  id: string,
  isAvailable: boolean,
  reason?: string,
  userId?: string,
) {
  const Vehicle = getVehicleModel();
  const MaintenanceLog = getMaintenanceLogModel();

  const vehicle = await Vehicle.findOneAndUpdate(
    { _id: id, isActive: { $ne: false } },
    { isAvailable },
    { new: true, runValidators: true },
  );

  if (!vehicle) {
    throw new AppError('Vehicle not found', 404, 'VEHICLE_NOT_FOUND');
  }

  if (reason?.trim()) {
    await MaintenanceLog.create({
      vehicle: vehicle._id,
      type: 'inspection',
      description: `Availability changed to ${isAvailable ? 'available' : 'unavailable'}: ${reason.trim()}`,
      performedAt: new Date(),
      performedBy: userId ? `User ${userId}` : 'System',
      notes: reason.trim(),
    });
  }

  return vehicle;
}

export async function getVehicleReservations(
  vehicleId: string,
  page: number,
  limit: number,
) {
  const Reservation = getReservationModel();
  const safePage = Math.max(1, page);
  const safeLimit = Math.min(100, Math.max(1, limit));
  const skip = (safePage - 1) * safeLimit;

  const filter = { vehicle: vehicleId };
  const [reservations, total] = await Promise.all([
    Reservation.find(filter)
      .populate('client', 'firstName lastName phone')
      .populate('agent', 'name')
      .sort('-startDate')
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

export async function getVehicleMaintenanceLogs(vehicleId: string) {
  const MaintenanceLog = getMaintenanceLogModel();
  return MaintenanceLog.find({ vehicle: vehicleId }).sort('-performedAt');
}

/** @deprecated Use listVehicles */
export class VehicleService {
  static listVehicles = listVehicles;
  static getById = getVehicleById;
  static create = createVehicle;
  static update = updateVehicle;
  static remove = softDeleteVehicle;
}
