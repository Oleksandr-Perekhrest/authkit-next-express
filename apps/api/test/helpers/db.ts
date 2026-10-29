// outsource dependencies
import { Pool } from "pg";

const REQUIRED_DB = "authkit_test";

let pool: Pool | null = null;

function getPool(): Pool {
    if (!pool) {
        const url = process.env.DATABASE_URL;
        if (!url) throw new Error("DATABASE_URL is not set");

        const dbName = new URL(url).pathname.slice(1);
        if (dbName !== REQUIRED_DB) {
            throw new Error(
                `Safety guard: integration tests require DATABASE_URL pointing to '${REQUIRED_DB}', got '${dbName}'`,
            );
        }

        pool = new Pool({ connectionString: url });
    }
    return pool;
}

export async function truncateAll(): Promise<void> {
    const p = getPool();
    const { rows } = await p.query<{ tablename: string }>(
        "SELECT tablename FROM pg_tables WHERE schemaname = 'public' AND tablename <> '_prisma_migrations'",
    );
    if (rows.length === 0) return;
    const tables = rows.map((r) => `"${r.tablename}"`).join(", ");
    await p.query(`TRUNCATE ${tables} RESTART IDENTITY CASCADE`);
}

export async function closeDb(): Promise<void> {
    if (pool) {
        await pool.end();
        pool = null;
    }
}
