import { z } from 'zod';

export const reservationIdParamSchema = z.object({
  reservationId: z.string().regex(/^[0-9a-fA-F]{24}$/, 'Invalid reservation ID'),
});

export const contractIdSchema = z.object({
  id: z.string().regex(/^[0-9a-fA-F]{24}$/, 'Invalid contract ID'),
});
