import { z } from 'zod';

export const vehicleIdParamSchema = z.object({
  vehicleId: z.string().regex(/^[0-9a-fA-F]{24}$/, 'Invalid vehicle ID'),
});

export const clientIdParamSchema = z.object({
  clientId: z.string().regex(/^[0-9a-fA-F]{24}$/, 'Invalid client ID'),
});

export const maintenanceLogIdParamSchema = z.object({
  logId: z.string().regex(/^[0-9a-fA-F]{24}$/, 'Invalid maintenance log ID'),
});

export const deleteVehicleImageSchema = z.object({
  imageUrl: z.string().url('Invalid image URL'),
});

export const avatarQuerySchema = z.object({
  userId: z.string().regex(/^[0-9a-fA-F]{24}$/).optional(),
});
