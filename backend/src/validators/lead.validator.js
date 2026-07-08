// backend/src/validators/lead.validator.js
const { z } = require('zod');

// Single source of truth for what a valid lead submission looks like.
// The frontend has its own copy (lib/validation.ts) for instant client-side
// feedback, but the server NEVER trusts the client — this is what actually
// gates what reaches the database.
const leadSchema = z.object({
  fullName: z
    .string('Full name is required.')
    .trim()
    .min(2, 'Full name must be at least 2 characters.')
    .max(120, 'Full name must be under 120 characters.'),

  // .trim() + .max() run on the raw string first, then the cleaned value is
  // piped into z.email() for format validation — so " Foo@Bar.com " is
  // normalized before we decide whether it's a valid address.
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
    .optional(),

  message: z
    .string('Message is required.')
    .trim()
    .min(10, 'Message must be at least 10 characters.')
    .max(2000, 'Message must be under 2000 characters.'),
});

function validateLead(payload) {
  return leadSchema.safeParse(payload);
}

module.exports = { leadSchema, validateLead };