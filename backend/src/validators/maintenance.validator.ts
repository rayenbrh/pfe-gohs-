import { z } from 'zod';

const partSchema = z.object({
  name: z.string().min(1).trim(),
  cost: z.coerce.number().nonnegative(),
});

export const createMaintenanceSchema = z.object({
  vehicleId: z.string().regex(/^[a-f\d]{24}$/i, 'Invalid vehicle ID'),
  type: z.enum(['scheduled', 'repair', 'inspection', 'tire_change', 'oil_change']),
  description: z.string().min(5).max(1000).trim(),
  cost: z.coerce.number().nonnegative().default(0),
  mileageAtService: z.coerce.number().nonnegative().optional(),
  performedAt: z.string().datetime().transform((val) => new Date(val)),
  performedBy: z.string().min(2).max(200).trim(),
  parts: z.array(partSchema).optional(),
  nextScheduledDate: z
    .string()
    .datetime()
    .optional()
    .transform((val) => (val ? new Date(val) : undefined)),
  nextScheduledMileage: z.coerce.number().positive().optional(),
  notes: z.string().max(500).optional(),
});

export const updateMaintenanceSchema = createMaintenanceSchema
  .partial()
  .extend({ vehicleId: z.string().regex(/^[a-f\d]{24}$/i).optional() });

export const maintenanceIdSchema = z.object({
  id: z.string().regex(/^[0-9a-fA-F]{24}$/, 'Invalid maintenance log ID'),
});

export const vehicleIdParamSchema = z.object({
  vehicleId: z.string().regex(/^[0-9a-fA-F]{24}$/, 'Invalid vehicle ID'),
});
