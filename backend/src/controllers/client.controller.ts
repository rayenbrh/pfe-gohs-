import type { Request, Response } from 'express';

import * as clientService from '../services/client.service';
import { assertUniqueIdNumber } from '../services/client.service';
import { catchAsync } from '../utils/catchAsync';

export const getClients = catchAsync(async (req: Request, res: Response) => {
  const result = await clientService.listClients(req.query as Record<string, string | undefined>);

  res.status(200).json({
    status: 'success',
    results: result.results,
    totalPages: result.totalPages,
    currentPage: result.currentPage,
    data: { clients: result.clients },
  });
});

export const getClient = catchAsync(async (req: Request, res: Response) => {
  const { client, recentReservations, totalSpent } = await clientService.getClientById(req.params.id);

  res.status(200).json({
    status: 'success',
    data: { client, recentReservations, totalSpent },
  });
});

export const createClient = catchAsync(async (req: Request, res: Response) => {
  await assertUniqueIdNumber(req.body.idNumber);

  const client = await clientService.createClient(req.body);

  res.status(201).json({
    status: 'success',
    data: { client },
  });
});

export const updateClient = catchAsync(async (req: Request, res: Response) => {
  if (req.body.idNumber) {
    await assertUniqueIdNumber(req.body.idNumber, req.params.id);
  }

  const client = await clientService.updateClient(req.params.id, req.body);

  res.status(200).json({
    status: 'success',
    data: { client },
  });
});

export const blacklistClient = catchAsync(async (req: Request, res: Response) => {
  const { isBlacklisted, reason } = req.body as { isBlacklisted: boolean; reason?: string };

  const client = await clientService.toggleBlacklist(req.params.id, isBlacklisted, reason);

  res.status(200).json({
    status: 'success',
    data: { client },
  });
});

export const getClientHistory = catchAsync(async (req: Request, res: Response) => {
  const page = parseInt(String(req.query.page ?? '1'), 10);
  const limit = parseInt(String(req.query.limit ?? '20'), 10);

  const result = await clientService.getClientHistory(req.params.id, page, limit);

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

export const deleteClient = catchAsync(async (req: Request, res: Response) => {
  const client = await clientService.softDeleteClient(req.params.id);

  res.status(200).json({
    status: 'success',
    data: { client },
    message: 'Client deactivated successfully',
  });
});
