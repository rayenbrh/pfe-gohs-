import type { Request, Response } from 'express';
import { z } from 'zod';

import {
  getDashboardStats as fetchDashboardStats,
  getFleetAvailability,
  getMonthlyReport,
  getReservationsChart,
  getRevenueChart,
  getVehiclesByCategoryChart,
} from '../services/stats.service';
import { AppError } from '../utils/AppError';
import { catchAsync } from '../utils/catchAsync';

const monthQuerySchema = z.object({
  month: z.string().regex(/^\d{4}-\d{2}$/, 'month must be YYYY-MM'),
});

export const getStats = catchAsync(async (_req: Request, res: Response) => {
  const stats = await fetchDashboardStats();
  res.json({ success: true, data: stats });
});

export const getRevenueChartHandler = catchAsync(async (req: Request, res: Response) => {
  const period = typeof req.query.period === 'string' ? req.query.period : undefined;
  const data = await getRevenueChart(period);
  res.json({ success: true, data });
});

export const getReservationsChartHandler = catchAsync(async (_req: Request, res: Response) => {
  const data = await getReservationsChart();
  res.json({ success: true, data });
});

export const getVehiclesByCategoryHandler = catchAsync(async (_req: Request, res: Response) => {
  const data = await getVehiclesByCategoryChart();
  res.json({ success: true, data });
});

export const getMonthlyReportHandler = catchAsync(async (req: Request, res: Response) => {
  const parsed = monthQuerySchema.safeParse(req.query);
  if (!parsed.success) {
    throw new AppError('Query param month is required (YYYY-MM)', 400, 'VALIDATION_ERROR');
  }
  const data = await getMonthlyReport(parsed.data.month);
  res.json({ success: true, data });
});

export const getFleetAvailabilityHandler = catchAsync(async (_req: Request, res: Response) => {
  const data = await getFleetAvailability();
  res.json({ success: true, data });
});

export const getHealth = catchAsync(async (_req: Request, res: Response) => {
  res.json({
    success: true,
    data: {
      status: 'ok',
      service: 'inova-ride-api',
      timestamp: new Date().toISOString(),
      uptime: process.uptime(),
    },
  });
});

/** @deprecated Use getStats */
export const getDashboardStats = getStats;
