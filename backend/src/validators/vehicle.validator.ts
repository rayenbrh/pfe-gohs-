import { z } from 'zod';

const currentYear = new Date().getFullYear();

export const createVehicleSchema = z.object({
  brand: z.string().min(1).max(50).trim(),
  model: z.string().min(1).max(100).trim(),
  year: z.coerce.number().int().min(1990).max(currentYear + 1),
  licensePlate: z
    .string()
    .min(3)
    .max(20)
    .trim()
    .transform((val) => val.toUpperCase()),
  category: z.enum(['economy', 'luxury', 'utility', 'suv', 'van']),
  color: z.string().min(2).max(50).trim(),
  seats: z.coerce.number().int().min(2).max(12),
  transmission: z.enum(['manual', 'automatic']),
  fuelType: z.enum(['diesel', 'petrol', 'electric', 'hybrid']),
  pricePerDay: z.coerce.number().positive().max(10000),
  description: z.string().max(1000).optional(),
  features: z.array(z.string()).optional(),
  mileage: z.coerce.number().nonnegative().optional(),
  nextMaintenanceDate: z
    .string()
    .datetime()
    .optional()
    .transform((val) => (val ? new Date(val) : undefined)),
  maintenanceIntervalKm: z.coerce.number().positive().optional(),
});

export const updateVehicleSchema = createVehicleSchema.partial();

export const availabilityQuerySchema = z.object({
  startDate: z.string().datetime().transform((val) => new Date(val)),
  endDate: z.string().datetime().transform((val) => new Date(val)),
  category: z.enum(['economy', 'luxury', 'utility', 'suv', 'van']).optional(),
});

export const updateAvailabilitySchema = z.object({
  isAvailable: z.boolean(),
  reason: z.string().max(500).optional(),
});

export const vehicleIdSchema = z.object({
  id: z.string().regex(/^[0-9a-fA-F]{24}$/, 'Invalid vehicle ID'),
});

export type CreateVehicleInput = z.infer<typeof createVehicleSchema>;
export type UpdateVehicleInput = z.infer<typeof updateVehicleSchema>;
export type AvailabilityQueryInput = z.infer<typeof availabilityQuerySchema>;
