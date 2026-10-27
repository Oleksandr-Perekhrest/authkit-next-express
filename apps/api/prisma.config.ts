// outsource dependencies
import { existsSync } from "node:fs";
import { env, defineConfig } from "prisma/config";

if (existsSync(".env")) process.loadEnvFile(".env");

export default defineConfig({
    schema: "prisma/schema.prisma",
    migrations: { path: "prisma/migrations" },
    datasource: { url: env("DATABASE_URL") },
});
