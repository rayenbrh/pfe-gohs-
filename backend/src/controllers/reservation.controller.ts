import type { Request, Response } from 'express';

import * as reservationService from '../services/reservation.service';
import { createDraftInvoiceForReservation } from '../services/invoice.service';
import { AppError } from '../utils/AppError';
import { catchAsync } from '../utils/catchAsync';

export const getReservations = catchAsync(async (req: Request, res: Response) => {
  const result = await reservationService.listReservations(
    req.query as Record<string, string | undefined>,
  );

  res.status(200).json({
    status: 'success',
    results: result.results,
    totalPages: result.totalPages,
    currentPage: result.currentPage,
    data: { reservations: result.reservations },
  });
});

export const getCalendar = catchAsync(async (req: Request, res: Response) => {
  const { month } = req.query as unknown as { month: string };
  const events = await reservationService.getCalendarReservations(month);

  res.status(200).json({
    status: 'success',
    results: events.length,
    data: { events },
  });
});

export const getReservation = catchAsync(async (req: Request, res: Response) => {
  const { reservation, contract, invoice } = await reservationService.getReservationById(
    req.params.id,
  );

  res.status(200).json({
    status: 'success',
    data: { reservation, contract, invoice },
  });
});

export const createReservation = catchAsync(async (req: Request, res: Response) => {
  const body = req.body as {
    vehicleId: string;
    clientId: string;
    startDate: string;
    endDate: string;
    pickupLocation: string;
    returnLocation: string;
    paymentMethod: 'cash' | 'card' | 'online';
    depositAmount?: number;
    notes?: string;
  };

  const reservation = await reservationService.createReservation(
    {
      ...body,
      startDate: new Date(body.startDate),
      endDate: new Date(body.endDate),
    },
    req.user!._id,
  );

  const invoice = await createDraftInvoiceForReservation(reservation);

  res.status(201).json({
    status: 'success',
    data: { reservation, invoice },
  });
});

export const updateStatus = catchAsync(async (req: Request, res: Response) => {
  const { status, cancellationReason, actualReturnDate, extraCharges } = req.body as {
    status: 'confirmed' | 'active' | 'completed' | 'cancelled';
    cancellationReason?: string;
    actualReturnDate?: Date;
    extraCharges?: number;
  };

  let result: unknown;

  switch (status) {
    case 'confirmed':
      result = await reservationService.transitionToConfirmed(req.params.id);
      break;
    case 'active':
      result = await reservationService.transitionToActive(req.params.id);
      break;
    case 'completed':
      result = await reservationService.completeReservation(
        req.params.id,
        actualReturnDate,
        extraCharges ?? 0,
      );
      break;
    case 'cancelled':
      result = await reservationService.cancelReservation(
        req.params.id,
        cancellationReason,
        req.user!._id,
      );
      break;
    default:
      throw new AppError('Invalid status', 400, 'INVALID_STATUS');
  }

  res.status(200).json({
    status: 'success',
    data: result,
  });
});

export const updateReservation = catchAsync(async (req: Request, res: Response) => {
  const reservation = await reservationService.updateReservationFields(req.params.id, req.body);

  res.status(200).json({
    status: 'success',
    data: { reservation },
  });
});

export const deleteReservation = catchAsync(async (req: Request, res: Response) => {
  await reservationService.hardDeleteReservation(req.params.id);

  res.status(200).json({
    status: 'success',
    message: 'Reservation deleted permanently',
  });
});
