import { z } from 'zod';

export const leadFormSchema = z.object({
  fullName: z
    .string()
    .trim()
    .min(2, 'Full name must be at least 2 characters.')
    .max(120, 'Full name must be under 120 characters.'),

  email: z
    .string()
    .trim()
    .toLowerCase()
    .max(255, 'Email must be under 255 characters.')
    .pipe(z.email('Please enter a valid email address.')),

  businessName: z
    .string()
    .trim()
    .max(150, 'Business name must be under 150 characters.')
    .optional()
    .or(z.literal('')),

  message: z
    .string()
    .trim()
    .min(10, 'Message must be at least 10 characters.')
    .max(2000, 'Message must be under 2000 characters.'),
});

export type LeadFormSchema = z.infer<typeof leadFormSchema>;
