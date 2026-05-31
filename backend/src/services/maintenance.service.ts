import type { FilterQuery } from 'mongoose';

import { getMaintenanceLogModel } from '../models/MaintenanceLog';
import { getVehicleModel } from '../models/Vehicle';
import type { IMaintenanceLogDocument } from '../types/models';
import { APIFeatures } from '../utils/apiFeatures';
import { AppError } from '../utils/AppError';

export async function syncVehicleFromMaintenanceLog(
  log: Pick<IMaintenanceLogDocument, 'vehicle' | 'nextScheduledDate' | 'mileageAtService'>,
): Promise<void> {
  const Vehicle = getVehicleModel();
  const update: Record<string, unknown> = {};
  if (log.nextScheduledDate) update.nextMaintenanceDate = log.nextScheduledDate;
  if (log.mileageAtService != null) update.mileage = log.mileageAtService;
  if (Object.keys(update).length === 0) return;
  await Vehicle.findByIdAndUpdate(log.vehicle, update);
}

export async function listMaintenanceLogs(query: Record<string, string | undefined>) {
  const Vehicle = getVehicleModel();
  const MaintenanceLog = getMaintenanceLogModel();

  if (query.upcoming === 'true') {
    const withinDays = 30;
    const deadline = new Date(Date.now() + withinDays * 24 * 60 * 60 * 1000);
    const vehicles = await Vehicle.find({
      isActive: { $ne: false },
      nextMaintenanceDate: { $lte: deadline },
    })
      .select('brand model year licensePlate category nextMaintenanceDate mileage')
      .sort('nextMaintenanceDate');

    return {
      upcoming: true as const,
      vehicles,
      results: vehicles.length,
    };
  }

  const filter: FilterQuery<IMaintenanceLogDocument> = {};
  if (query.vehicleId) filter.vehicle = query.vehicleId;
  if (query.type) filter.type = query.type;

  if (query.dateFrom || query.dateTo) {
    filter.performedAt = {};
    if (query.dateFrom) {
      (filter.performedAt as Record<string, Date>).$gte = new Date(query.dateFrom);
    }
    if (query.dateTo) {
      (filter.performedAt as Record<string, Date>).$lte = new Date(query.dateTo);
    }
  }

  const features = new APIFeatures(
    MaintenanceLog.find(filter)
      .populate('vehicle', 'brand model licensePlate')
      .sort('-performedAt'),
    query,
  )
    .limitFields()
    .paginate();

  const logs = await features.query;
  const total = await features.paginationResult!.totalCountPromise;
  const limit = features.paginationResult!.limit;
  const skip = features.paginationResult!.skip;

  return {
    upcoming: false as const,
    logs,
    results: logs.length,
    total,
    totalPages: Math.ceil(total / limit) || 1,
    currentPage: Math.floor(skip / limit) + 1,
  };
}

export async function getMaintenanceLogById(id: string) {
  const MaintenanceLog = getMaintenanceLogModel();
  const log = await MaintenanceLog.findById(id).populate('vehicle');
  if (!log) throw new AppError('Maintenance log not found', 404, 'MAINTENANCE_NOT_FOUND');
  return log;
}

export async function createMaintenanceLog(data: {
  vehicleId: string;
  type: string;
  description: string;
  cost?: number;
  mileageAtService?: number;
  performedAt: Date;
  performedBy: string;
  parts?: Array<{ name: string; cost: number }>;
  nextScheduledDate?: Date;
  nextScheduledMileage?: number;
  notes?: string;
}) {
  const Vehicle = getVehicleModel();
  const MaintenanceLog = getMaintenanceLogModel();

  const vehicle = await Vehicle.findOne({ _id: data.vehicleId, isActive: { $ne: false } });
  if (!vehicle) throw new AppError('Vehicle not found', 404, 'VEHICLE_NOT_FOUND');

  const log = await MaintenanceLog.create({
    vehicle: data.vehicleId,
    type: data.type,
    description: data.description,
    cost: data.cost ?? 0,
    mileageAtService: data.mileageAtService,
    performedAt: data.performedAt,
    performedBy: data.performedBy,
    parts: data.parts ?? [],
    nextScheduledDate: data.nextScheduledDate,
    nextScheduledMileage: data.nextScheduledMileage,
    notes: data.notes,
  });

  await syncVehicleFromMaintenanceLog(log);
  return log.populate('vehicle', 'brand model licensePlate');
}

export async function updateMaintenanceLog(
  id: string,
  data: Partial<{
    vehicleId: string;
    type: string;
    description: string;
    cost: number;
    mileageAtService: number;
    performedAt: Date;
    performedBy: string;
    parts: Array<{ name: string; cost: number }>;
    nextScheduledDate: Date;
    nextScheduledMileage: number;
    notes: string;
  }>,
) {
  const Vehicle = getVehicleModel();
  const MaintenanceLog = getMaintenanceLogModel();

  if (data.vehicleId) {
    const vehicle = await Vehicle.findOne({ _id: data.vehicleId, isActive: { $ne: false } });
    if (!vehicle) throw new AppError('Vehicle not found', 404, 'VEHICLE_NOT_FOUND');
  }

  const { vehicleId, ...rest } = data;
  const updatePayload = {
    ...rest,
    ...(vehicleId ? { vehicle: vehicleId } : {}),
  };

  const log = await MaintenanceLog.findByIdAndUpdate(id, updatePayload, {
    new: true,
    runValidators: true,
  }).populate('vehicle', 'brand model licensePlate');

  if (!log) throw new AppError('Maintenance log not found', 404, 'MAINTENANCE_NOT_FOUND');

  await syncVehicleFromMaintenanceLog(log);
  return log;
}

export async function deleteMaintenanceLog(id: string) {
  const MaintenanceLog = getMaintenanceLogModel();
  const log = await MaintenanceLog.findByIdAndDelete(id);
  if (!log) throw new AppError('Maintenance log not found', 404, 'MAINTENANCE_NOT_FOUND');
  return log;
}

export async function getVehicleMaintenanceHistory(vehicleId: string) {
  const Vehicle = getVehicleModel();
  const MaintenanceLog = getMaintenanceLogModel();

  const vehicle = await Vehicle.findOne({ _id: vehicleId, isActive: { $ne: false } });
  if (!vehicle) throw new AppError('Vehicle not found', 404, 'VEHICLE_NOT_FOUND');

  const logs = await MaintenanceLog.find({ vehicle: vehicleId }).sort('-performedAt');

  const totalCost = logs.reduce((sum, l) => sum + l.cost, 0);
  const lastServiceDate = logs[0]?.performedAt ?? null;

  return {
    vehicle,
    logs,
    summary: {
      totalEntries: logs.length,
      totalCost,
      lastServiceDate,
    },
  };
}
