// outsource dependencies
import { z } from "zod";

// Deliberate choice: OWASP minimum of 8, not NIST's 15 for password-only
// login. No composition rules. See "Security decisions" in README.
export const PASSWORD_MIN_LENGTH = 8;
export const PASSWORD_MAX_LENGTH = 128;

const emailSchema = z.string().trim().toLowerCase().pipe(z.email());

export const registerSchema = z.object({
    email: emailSchema,
    password: z.string().min(PASSWORD_MIN_LENGTH).max(PASSWORD_MAX_LENGTH),
    name: z.string().trim().min(1).max(100).optional(),
});

export const loginSchema = z.object({
    email: emailSchema,
    password: z.string().min(1).max(PASSWORD_MAX_LENGTH),
});

export type RegisterInput = z.infer<typeof registerSchema>;
export type LoginInput = z.infer<typeof loginSchema>;
