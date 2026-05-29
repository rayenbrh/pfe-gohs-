import cron from 'node-cron';

import logger from '../config/logger';
import Reservation from '../models/Reservation';
import User from '../models/User';
import Vehicle from '../models/Vehicle';
import { EmailService } from '../services/email.service';

function vehicleDisplayName(vehicle: {
  brand: string;
  model: string;
  year?: number;
  licensePlate?: string;
}): string {
  return `${vehicle.brand} ${vehicle.model}${vehicle.year ? ` ${vehicle.year}` : ''}`.trim();
}

function daysUntil(date: Date): number {
  const ms = date.getTime() - Date.now();
  return Math.ceil(ms / (24 * 60 * 60 * 1000));
}

function tomorrowRange(): { start: Date; end: Date } {
  const start = new Date();
  start.setDate(start.getDate() + 1);
  start.setHours(0, 0, 0, 0);
  const end = new Date(start);
  end.setDate(end.getDate() + 1);
  return { start, end };
}

export async function runMaintenanceAlertJob(): Promise<number> {
  const deadline = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000);

  const vehicles = await Vehicle.find({
    isActive: { $ne: false },
    nextMaintenanceDate: { $lte: deadline },
  }).select('brand model year licensePlate nextMaintenanceDate mileage category');

  if (vehicles.length === 0) {
    logger.info('Maintenance alerts sent', { count: 0 });
    return 0;
  }

  const admins = await User.find({
    role: { $in: ['admin', 'super_admin'] },
    isActive: { $ne: false },
  }).select('email name');

  if (admins.length === 0) {
    logger.warn('No admin users found — skipping maintenance alert emails');
    return 0;
  }

  for (const vehicle of vehicles) {
    const name = vehicleDisplayName(vehicle);
    const dueDate = vehicle.nextMaintenanceDate!;
    const remaining = daysUntil(dueDate);

    for (const admin of admins) {
      await EmailService.sendMaintenanceAlert(admin.email, {
        vehicleName: name,
        licensePlate: vehicle.licensePlate,
        dueDate,
        daysRemaining: remaining,
        mileage: vehicle.mileage,
        category: vehicle.category,
      });
    }
  }

  logger.info('Maintenance alerts sent', { count: vehicles.length });
  return vehicles.length;
}

export async function runReservationReminderJob(): Promise<number> {
  const { start, end } = tomorrowRange();

  const reservations = await Reservation.find({
    status: 'confirmed',
    startDate: { $gte: start, $lt: end },
  })
    .populate('client', 'firstName lastName email')
    .populate('vehicle', 'brand model year licensePlate');

  for (const reservation of reservations) {
    const client = reservation.client as {
      firstName?: string;
      lastName?: string;
      email?: string;
    } | null;
    const vehicle = reservation.vehicle as {
      brand?: string;
      model?: string;
      year?: number;
    } | null;

    if (!client?.email) continue;

    const vehicleName = vehicle
      ? vehicleDisplayName({
          brand: vehicle.brand ?? '',
          model: vehicle.model ?? '',
          year: vehicle.year,
        })
      : 'your vehicle';

    await EmailService.sendReservationPickupReminder(client.email, {
      clientName: `${client.firstName ?? ''} ${client.lastName ?? ''}`.trim() || 'Client',
      reservationNumber: reservation.reservationNumber,
      vehicleName,
      startDate: reservation.startDate,
      pickupLocation: reservation.pickupLocation,
    });
  }

  logger.info('Reservation reminders sent', { count: reservations.length });
  return reservations.length;
}

export async function runExpiredPaymentsJob(): Promise<number> {
  const cutoff = new Date(Date.now() - 30 * 60 * 1000);

  const expired = await Reservation.find({
    status: 'pending',
    paymentMethod: 'online',
    createdAt: { $lt: cutoff },
  });

  for (const reservation of expired) {
    reservation.status = 'cancelled';
    reservation.paymentStatus = 'unpaid';
    reservation.cancellationReason = 'Payment link expired';
    reservation.cancelledAt = new Date();
    await reservation.save();
    await Vehicle.findByIdAndUpdate(reservation.vehicle, { isAvailable: true });
  }

  logger.info('Expired pending reservations cancelled', { count: expired.length });
  return expired.length;
}

export function startCronJobs(): void {
  cron.schedule('0 9 * * *', async () => {
    try {
      await runMaintenanceAlertJob();
    } catch (error) {
      logger.error('Maintenance alert cron job failed', { error });
    }
  });

  cron.schedule('0 10 * * *', async () => {
    try {
      await runReservationReminderJob();
    } catch (error) {
      logger.error('Reservation reminder cron job failed', { error });
    }
  });

  cron.schedule('*/30 * * * *', async () => {
    try {
      await runExpiredPaymentsJob();
    } catch (error) {
      logger.error('Expired payments cron job failed', { error });
    }
  });

  logger.info('Cron jobs scheduled (maintenance 09:00, reminders 10:00, expired payments */30min)');
}

/** @deprecated Use startCronJobs */
export const startMaintenanceAlertJob = startCronJobs;
