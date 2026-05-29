import { z } from 'zod';

const objectId = z.string().regex(/^[a-f\d]{24}$/i, 'Invalid ID');

export const createReservationSchema = z
  .object({
    vehicleId: objectId,
    clientId: objectId,
    startDate: z.string().datetime(),
    endDate: z.string().datetime(),
    pickupLocation: z.string().min(2).max(200).trim(),
    returnLocation: z.string().min(2).max(200).trim(),
    paymentMethod: z.enum(['cash', 'card', 'online']),
    depositAmount: z.coerce.number().nonnegative().optional(),
    notes: z.string().max(1000).optional(),
  })
  .refine((data) => new Date(data.endDate) > new Date(data.startDate), {
    message: 'End date must be after start date',
    path: ['endDate'],
  })
  .refine(
    (data) => new Date(data.startDate) >= new Date(new Date().setHours(0, 0, 0, 0)),
    { message: 'Start date cannot be in the past', path: ['startDate'] },
  );

export const updateStatusSchema = z.object({
  status: z.enum(['confirmed', 'active', 'completed', 'cancelled']),
  cancellationReason: z.string().optional(),
  actualReturnDate: z.string().datetime().optional().transform((val) => (val ? new Date(val) : undefined)),
  extraCharges: z.coerce.number().nonnegative().optional(),
});

export const updateReservationFieldsSchema = z.object({
  pickupLocation: z.string().min(2).max(200).trim().optional(),
  returnLocation: z.string().min(2).max(200).trim().optional(),
  notes: z.string().max(1000).optional(),
  depositAmount: z.coerce.number().nonnegative().optional(),
});

export const calendarQuerySchema = z.object({
  month: z.string().regex(/^\d{4}-\d{2}$/, 'Month must be in YYYY-MM format'),
});

export const reservationIdSchema = z.object({
  id: z.string().regex(/^[0-9a-fA-F]{24}$/, 'Invalid reservation ID'),
});

export type CreateReservationInput = z.infer<typeof createReservationSchema>;
export type UpdateStatusInput = z.infer<typeof updateStatusSchema>;
