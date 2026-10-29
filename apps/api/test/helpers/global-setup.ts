// outsource dependencies
import { Client } from "pg";
import { fileURLToPath } from "node:url";
import { dirname, resolve } from "node:path";
import { execSync } from "node:child_process";

const TEST_DB_NAME = "authkit_test";
const TEST_DB_URL = `postgresql://authkit:authkit@localhost:5432/${TEST_DB_NAME}`;
// Connect to the default postgres admin DB to issue CREATE DATABASE
const ADMIN_DB_URL = "postgresql://authkit:authkit@localhost:5432/postgres";

const API_DIR = resolve(dirname(fileURLToPath(import.meta.url)), "../..");

export async function setup() {
    const dbName = new URL(TEST_DB_URL).pathname.slice(1);
    if (dbName !== TEST_DB_NAME) {
        throw new Error(
            `Safety guard: TEST_DB_URL must target '${TEST_DB_NAME}', got '${dbName}'`,
        );
    }

    const client = new Client({ connectionString: ADMIN_DB_URL });
    await client.connect();

    const { rows } = await client.query<{ exists: number }>(
        "SELECT 1 FROM pg_database WHERE datname = $1",
        [TEST_DB_NAME],
    );

    if (rows.length === 0) {
        await client.query(`CREATE DATABASE "${TEST_DB_NAME}"`);
    }

    await client.end();

    execSync("./node_modules/.bin/prisma migrate deploy", {
        cwd: API_DIR,
        env: { ...process.env, DATABASE_URL: TEST_DB_URL },
        stdio: "inherit",
    });
}
