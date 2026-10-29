// outsource dependencies
import { Pool } from "pg";
import request from "supertest";
import { it, expect, afterAll, describe, beforeEach } from "vitest";

// local dependencies
import { createApp } from "../../src/app";
import { closeDb, truncateAll } from "../helpers/db";

const app = createApp();
const pool = new Pool({ connectionString: process.env.DATABASE_URL });

afterAll(async () => {
    await pool.end();
    await closeDb();
});

describe("POST /auth/logout", () => {
    beforeEach(() => truncateAll());

    it("clears auth cookies, removes refresh token from DB, and blocks further refresh", async () => {
        const agent = request.agent(app);
        await agent
            .post("/auth/register")
            .send({ email: "user@example.com", password: "password123" })
            .expect(201);

        const logoutRes = await agent.post("/auth/logout");
        expect(logoutRes.status).toBe(204);

        // Both cookie names must appear in Set-Cookie (clearing them)
        const setCookies = logoutRes.headers[
            "set-cookie"
        ] as unknown as string[];
        const names = setCookies.map((c) => c.split("=")[0]);
        expect(names).toContain("access_token");
        expect(names).toContain("refresh_token");

        // Refresh token row deleted from DB
        const { rows } = await pool.query('SELECT 1 FROM "RefreshToken"');
        expect(rows).toHaveLength(0);

        // Session is gone: subsequent refresh must fail
        const refreshRes = await agent.post("/auth/refresh");
        expect(refreshRes.status).toBe(401);
    });
});
