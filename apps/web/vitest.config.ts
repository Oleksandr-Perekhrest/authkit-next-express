// outsource dependencies
import path from "node:path";
import { defineConfig } from "vitest/config";

export default defineConfig({
    resolve: {
        alias: {
            "@": path.resolve(import.meta.dirname, "src"),
            "client-only": path.resolve(
                import.meta.dirname,
                "__mocks__/client-only.ts",
            ),
        },
    },
    test: {
        environment: "node",
    },
});
