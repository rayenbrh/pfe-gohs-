import type { Request, Response } from 'express';

import Reservation from '../models/Reservation';
import logger from '../config/logger';
import * as paymentService from '../services/payment.service';
import { AppError } from '../utils/AppError';
import { catchAsync } from '../utils/catchAsync';

export const initPayment = catchAsync(async (req: Request, res: Response) => {
  const { reservationId } = req.body as { reservationId: string };

  const reservation = await Reservation.findById(reservationId)
    .populate('client', 'firstName lastName email phone')
    .populate('vehicle', 'brand model');

  if (!reservation) {
    throw new AppError('Reservation not found', 404, 'RESERVATION_NOT_FOUND');
  }

  if (reservation.status !== 'pending') {
    throw new AppError('Only pending reservations can be paid online', 400, 'INVALID_STATUS');
  }

  if (reservation.paymentStatus !== 'unpaid') {
    throw new AppError('Reservation is already paid or partially paid', 400, 'ALREADY_PAID');
  }

  const result = await paymentService.initKonnectPayment({
    _id: reservation._id,
    reservationNumber: reservation.reservationNumber,
    totalPrice: reservation.totalPrice,
    depositAmount: reservation.depositAmount,
    client: reservation.client as unknown as {
      firstName: string;
      lastName: string;
      phone: string;
      email?: string;
    },
    vehicle: reservation.vehicle as unknown as { brand: string; model: string },
  });

  res.status(200).json({
    status: 'success',
    data: { payUrl: result.payUrl, paymentRef: result.paymentRef },
  });
});

export const konnectWebhook = catchAsync(async (req: Request, res: Response) => {
  const paymentRef =
    (req.body as { payment_ref?: string }).payment_ref ??
    (req.body as { paymentRef?: string }).paymentRef;

  if (!paymentRef) {
    logger.warn('Konnect webhook missing payment_ref', { body: req.body });
    res.status(200).json({ received: true });
    return;
  }

  try {
    await paymentService.processKonnectWebhook(paymentRef);
  } catch (error) {
    logger.error('Konnect webhook processing error', { paymentRef, error });
  }

  res.status(200).json({ received: true });
});

export const verifyPayment = catchAsync(async (req: Request, res: Response) => {
  const { paymentRef } = req.params;

  const konnectStatus = await paymentService.verifyKonnectPayment(paymentRef);

  const reservation = await Reservation.findOne({ konnectPaymentRef: paymentRef }).select(
    'reservationNumber status paymentStatus totalPrice',
  );

  res.status(200).json({
    status: 'success',
    data: {
      paymentStatus: konnectStatus.status,
      amount: konnectStatus.amount,
      reservation: reservation
        ? {
            reservationNumber: reservation.reservationNumber,
            status: reservation.status,
            paymentStatus: reservation.paymentStatus,
          }
        : null,
    },
  });
});

export const getPaymentHistory = catchAsync(async (req: Request, res: Response) => {
  const result = await paymentService.listPaymentHistory(
    req.query as Record<string, string | undefined>,
  );

  res.status(200).json({
    status: 'success',
    results: result.results,
    totalPages: result.totalPages,
    currentPage: result.currentPage,
    data: { payments: result.payments },
  });
});
