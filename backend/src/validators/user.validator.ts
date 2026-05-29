import { z } from 'zod';

export const updateUserSchema = z.object({
  name: z.string().min(2).max(100).trim().optional(),
  role: z.enum(['super_admin', 'admin', 'agent']).optional(),
  avatar: z.string().url().optional(),
  isActive: z.boolean().optional(),
});

export const userIdSchema = z.object({
  id: z.string().regex(/^[0-9a-fA-F]{24}$/, 'Invalid user ID'),
});
