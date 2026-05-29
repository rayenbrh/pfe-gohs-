import { z } from 'zod';

export function createBookingDetailsSchema(messages: {
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  nationality: string;
  idNumber: string;
}) {
  return z.object({
    firstName: z.string().min(2, messages.firstName),
    lastName: z.string().min(2, messages.lastName),
    email: z.string().email(messages.email),
    phone: z.string().min(8, messages.phone),
    nationality: z.string().min(2, messages.nationality),
    idType: z.enum(['cin', 'passport']),
    idNumber: z.string().min(6, messages.idNumber),
  });
}

export type BookingDetailsForm = z.infer<ReturnType<typeof createBookingDetailsSchema>>;
