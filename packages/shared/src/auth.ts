// outsource dependencies
import { z } from "zod";

// Deliberate choice: OWASP minimum of 8, not NIST's 15 for password-only
// login. No composition rules. See "Security decisions" in README.
export const PASSWORD_MIN_LENGTH = 8;
export const PASSWORD_MAX_LENGTH = 128;

const emailSchema = z.string().trim().toLowerCase().pipe(z.email());

export const nameSchema = z.string().trim().min(1).max(100);

export const registerSchema = z.object({
    email: emailSchema,
    password: z.string().min(PASSWORD_MIN_LENGTH).max(PASSWORD_MAX_LENGTH),
    name: nameSchema.optional(),
});

export const loginSchema = z.object({
    email: emailSchema,
    password: z.string().min(1).max(PASSWORD_MAX_LENGTH),
});

export type RegisterInput = z.infer<typeof registerSchema>;
export type LoginInput = z.infer<typeof loginSchema>;

export const updateProfileSchema = z.object({ name: nameSchema.nullable() });
export type UpdateProfileInput = z.infer<typeof updateProfileSchema>;

export const publicUserSchema = z.object({
    id: z.string(),
    name: z.string().nullable(),
    email: z.string(),
    createdAt: z.iso.datetime(),
});

export type PublicUser = z.infer<typeof publicUserSchema>;
export type UserResponse = { user: PublicUser };

export const GOOGLE_AUTH_ERRORS = {
    failed: "failed",
    cancelled: "cancelled",
    invalid_state: "invalid_state",
    account_exists: "account_exists",
    email_unverified: "email_unverified",
} as const;

export type GoogleAuthError =
    (typeof GOOGLE_AUTH_ERRORS)[keyof typeof GOOGLE_AUTH_ERRORS];

export const GOOGLE_AUTH_SUCCESS = {
    created: "google_created",
    login: "google_login",
} as const;
export type GoogleAuthSuccess =
    (typeof GOOGLE_AUTH_SUCCESS)[keyof typeof GOOGLE_AUTH_SUCCESS];

export const AUTH_TOAST_CODES = [
    ...Object.values(GOOGLE_AUTH_SUCCESS),
    ...Object.values(GOOGLE_AUTH_ERRORS),
] as const;
export type AuthToastCode = GoogleAuthSuccess | GoogleAuthError;
