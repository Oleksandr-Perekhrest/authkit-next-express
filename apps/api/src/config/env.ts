// outsource dependencies
import { z } from "zod";

const envSchema = z.object({
    NODE_ENV: z
        .enum(["development", "test", "production"])
        .default("development"),
    PORT: z.coerce.number().int().positive().default(4000),
    TRUST_PROXY: z.coerce.number().int().nonnegative().default(0),
    DATABASE_URL: z.url(),
    JWT_ACCESS_SECRET: z.string().min(32),
    GOOGLE_CLIENT_ID: z.string(),
    GOOGLE_CLIENT_SECRET: z.string(),
    GOOGLE_REDIRECT_URI: z.url(),
    // Per-window request limits for rate limiters; override in tests to avoid blocking
    REGISTER_RATE_LIMIT: z.coerce.number().int().positive().default(5),
    LOGIN_RATE_LIMIT: z.coerce.number().int().positive().default(10),
});

const parsed = envSchema.safeParse(process.env);

if (!parsed.success) {
    console.error(
        "Invalid environment variables:",
        z.flattenError(parsed.error).fieldErrors,
    );
    process.exit(1);
}

export const env = parsed.data;
