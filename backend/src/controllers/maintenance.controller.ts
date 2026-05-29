import type { Request, Response } from 'express';

import * as maintenanceService from '../services/maintenance.service';
import { catchAsync } from '../utils/catchAsync';

export const getMaintenanceLogs = catchAsync(async (req: Request, res: Response) => {
  const result = await maintenanceService.listMaintenanceLogs(
    req.query as Record<string, string | undefined>,
  );

  if (result.upcoming) {
    res.json({ success: true, data: { vehicles: result.vehicles }, meta: { results: result.results } });
    return;
  }

  res.json({
    success: true,
    data: result.logs,
    meta: {
      results: result.results,
      total: result.total,
      totalPages: result.totalPages,
      currentPage: result.currentPage,
    },
  });
});

export const getVehicleMaintenanceHistory = catchAsync(async (req: Request, res: Response) => {
  const data = await maintenanceService.getVehicleMaintenanceHistory(req.params.vehicleId);
  res.json({ success: true, data });
});

export const getMaintenanceLog = catchAsync(async (req: Request, res: Response) => {
  const log = await maintenanceService.getMaintenanceLogById(req.params.id);
  res.json({ success: true, data: log });
});

export const createMaintenanceLog = catchAsync(async (req: Request, res: Response) => {
  const body = req.body as {
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
  };

  const log = await maintenanceService.createMaintenanceLog(body);
  res.status(201).json({ success: true, data: log });
});

export const updateMaintenanceLog = catchAsync(async (req: Request, res: Response) => {
  const body = req.body as Partial<{
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
  }>;

  const log = await maintenanceService.updateMaintenanceLog(req.params.id, body);
  res.json({ success: true, data: log });
});

export const deleteMaintenanceLog = catchAsync(async (req: Request, res: Response) => {
  await maintenanceService.deleteMaintenanceLog(req.params.id);
  res.status(204).send();
});
