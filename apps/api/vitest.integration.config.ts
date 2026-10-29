// outsource dependencies
import { defineConfig } from "vitest/config";

export default defineConfig({
    test: {
        include: ["test/**/*.test.ts"],
        globalSetup: ["test/helpers/global-setup.ts"],
        fileParallelism: false,
        env: {
            DATABASE_URL:
                "postgresql://authkit:authkit@localhost:5432/authkit_test",
            JWT_ACCESS_SECRET:
                "integration-test-secret-that-is-at-least-32-chars",
            GOOGLE_CLIENT_ID: "test-google-client-id",
            GOOGLE_CLIENT_SECRET: "test-google-client-secret",
            GOOGLE_REDIRECT_URI: "https://example.com/auth/google/callback",
            REGISTER_RATE_LIMIT: "1000",
            LOGIN_RATE_LIMIT: "1000",
        },
    },
});
