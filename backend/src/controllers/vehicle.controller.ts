import type { Request, Response } from 'express';

import * as vehicleService from '../services/vehicle.service';
import { catchAsync } from '../utils/catchAsync';

export const getVehicles = catchAsync(async (req: Request, res: Response) => {
  const result = await vehicleService.listVehicles(req.query as Record<string, string | undefined>);

  res.status(200).json({
    status: 'success',
    results: result.results,
    totalPages: result.totalPages,
    currentPage: result.currentPage,
    data: { vehicles: result.vehicles },
  });
});

export const getAvailability = catchAsync(async (req: Request, res: Response) => {
  const { startDate, endDate, category } = req.query as unknown as {
    startDate: Date;
    endDate: Date;
    category?: string;
  };

  const vehicles = await vehicleService.getAvailableVehicles(startDate, endDate, {
    category,
  });

  res.status(200).json({
    status: 'success',
    results: vehicles.length,
    data: { vehicles },
  });
});

export const getVehicle = catchAsync(async (req: Request, res: Response) => {
  const vehicle = await vehicleService.getVehicleById(req.params.id);

  res.status(200).json({
    status: 'success',
    data: { vehicle },
  });
});

export const createVehicle = catchAsync(async (req: Request, res: Response) => {
  await vehicleService.assertUniqueLicensePlate(req.body.licensePlate);

  const vehicle = await vehicleService.createVehicle({
    ...req.body,
    images: [],
    addedBy: req.user!._id,
  });

  res.status(201).json({
    status: 'success',
    data: { vehicle },
  });
});

export const updateVehicle = catchAsync(async (req: Request, res: Response) => {
  if (req.body.licensePlate) {
    await vehicleService.assertUniqueLicensePlate(req.body.licensePlate, req.params.id);
  }

  const vehicle = await vehicleService.updateVehicle(req.params.id, req.body);

  res.status(200).json({
    status: 'success',
    data: { vehicle },
  });
});

export const updateAvailability = catchAsync(async (req: Request, res: Response) => {
  const { isAvailable, reason } = req.body as { isAvailable: boolean; reason?: string };

  const vehicle = await vehicleService.updateVehicleAvailability(
    req.params.id,
    isAvailable,
    reason,
    req.user!._id,
  );

  res.status(200).json({
    status: 'success',
    data: { vehicle },
  });
});

export const deleteVehicle = catchAsync(async (req: Request, res: Response) => {
  const vehicle = await vehicleService.softDeleteVehicle(req.params.id);

  res.status(200).json({
    status: 'success',
    data: { vehicle },
    message: 'Vehicle deactivated successfully',
  });
});

export const getVehicleReservations = catchAsync(async (req: Request, res: Response) => {
  const page = parseInt(String(req.query.page ?? '1'), 10);
  const limit = parseInt(String(req.query.limit ?? '20'), 10);

  const result = await vehicleService.getVehicleReservations(req.params.id, page, limit);

  res.status(200).json({
    status: 'success',
    results: result.reservations.length,
    data: { reservations: result.reservations },
    meta: {
      page: result.page,
      limit: result.limit,
      total: result.total,
      totalPages: result.totalPages,
    },
  });
});

export const getVehicleMaintenance = catchAsync(async (req: Request, res: Response) => {
  const logs = await vehicleService.getVehicleMaintenanceLogs(req.params.id);

  res.status(200).json({
    status: 'success',
    results: logs.length,
    data: { maintenanceLogs: logs },
  });
});
