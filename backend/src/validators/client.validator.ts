import { z } from 'zod';

export const createClientSchema = z.object({
  firstName: z.string().min(1).max(100).trim(),
  lastName: z.string().min(1).max(100).trim(),
  email: z.string().email().optional(),
  phone: z.string().regex(/^\+?[\d\s\-()]{7,20}$/, 'Invalid phone number'),
  nationality: z.string().min(2).max(100).trim(),
  idType: z.enum(['cin', 'passport', 'driving_license']),
  idNumber: z.string().min(4).max(30).trim(),
  idDocumentUrl: z.string().url().optional(),
  driverLicenseUrl: z.string().url().optional(),
  address: z.string().max(300).optional(),
  dateOfBirth: z
    .string()
    .datetime()
    .optional()
    .transform((val) => (val ? new Date(val) : undefined)),
  notes: z.string().max(2000).optional(),
});

export const updateClientSchema = createClientSchema.partial();

export const blacklistClientSchema = z.object({
  isBlacklisted: z.boolean(),
  reason: z.string().max(500).optional(),
});

export const clientIdSchema = z.object({
  id: z.string().regex(/^[0-9a-fA-F]{24}$/, 'Invalid client ID'),
});

export type CreateClientInput = z.infer<typeof createClientSchema>;
