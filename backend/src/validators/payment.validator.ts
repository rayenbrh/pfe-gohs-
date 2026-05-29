import { z } from 'zod';

export const initPaymentSchema = z.object({
  reservationId: z.string().regex(/^[0-9a-fA-F]{24}$/, 'Invalid reservation ID'),
});

export const konnectWebhookSchema = z
  .object({
    payment_ref: z.string().min(1),
    payment_status: z.string().optional(),
  })
  .passthrough();

export const paymentRefParamSchema = z.object({
  paymentRef: z.string().min(1),
});
