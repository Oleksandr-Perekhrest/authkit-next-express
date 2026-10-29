// outsource dependencies
import { defineConfig } from "vitest/config";

export default defineConfig({
    test: {
        include: ["src/**/*.test.ts"],
        env: {
            DATABASE_URL: "postgresql://test:test@localhost:5432/test",
            JWT_ACCESS_SECRET:
                "test-secret-that-is-at-least-32-characters-long",
            GOOGLE_CLIENT_ID: "test-google-client-id",
            GOOGLE_CLIENT_SECRET: "test-google-client-secret",
            GOOGLE_REDIRECT_URI: "https://example.com/auth/google/callback",
        },
    },
});
