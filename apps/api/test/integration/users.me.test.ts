// outsource dependencies
import { Pool } from "pg";
import request from "supertest";
import { it, expect, afterAll, describe, beforeEach } from "vitest";

// local dependencies
import { createApp } from "../../src/app";
import { registerAgent } from "../helpers/auth";
import { closeDb, truncateAll } from "../helpers/db";

const app = createApp();
const pool = new Pool({ connectionString: process.env.DATABASE_URL });

afterAll(async () => {
    await pool.end();
    await closeDb();
});

describe("PATCH /users/me", () => {
    beforeEach(() => truncateAll());

    it("returns 200 with the updated user when the name is valid", async () => {
        const agent = await registerAgent(app);
        const res = await agent.patch("/users/me").send({ name: "New Name" });
        expect(res.status).toBe(200);
        expect(res.body).toMatchObject({ user: { name: "New Name" } });
    });

    it("returns 400 on invalid name", async () => {
        const agent = await registerAgent(app);
        const res = await agent.patch("/users/me").send({ name: "" });
        expect(res.status).toBe(400);
        expect(res.body.error.code).toBe("VALIDATION_ERROR");
    });

    it("returns 401 without auth", async () => {
        const res = await request(app)
            .patch("/users/me")
            .send({ name: "Name" });
        expect(res.status).toBe(401);
    });
});

describe("DELETE /users/me", () => {
    beforeEach(() => truncateAll());

    it("removes the user and related rows from the DB; session no longer works afterward", async () => {
        const agent = request.agent(app);
        const regRes = await agent
            .post("/auth/register")
            .send({ email: "user@example.com", password: "password123" })
            .expect(201);
        const userId: string = regRes.body.user.id;

        // Insert a linked Account row so cascade deletion is exercised
        await pool.query(
            `INSERT INTO "Account" (id, "userId", provider, "providerAccountId", "createdAt")
             VALUES (gen_random_uuid(), $1, 'google', 'test-sub-123', NOW())`,
            [userId],
        );

        const deleteRes = await agent.delete("/users/me");
        expect(deleteRes.status).toBe(204);

        // User and all cascade-deleted rows must be gone
        const { rows: userRows } = await pool.query('SELECT 1 FROM "User"');
        expect(userRows).toHaveLength(0);

        const { rows: accountRows } = await pool.query(
            'SELECT 1 FROM "Account"',
        );
        expect(accountRows).toHaveLength(0);

        const { rows: tokenRows } = await pool.query(
            'SELECT 1 FROM "RefreshToken"',
        );
        expect(tokenRows).toHaveLength(0);

        // The session is invalidated: refresh must fail
        expect((await agent.post("/auth/refresh")).status).toBe(401);
    });

    it("returns 401 without auth", async () => {
        const res = await request(app).delete("/users/me");
        expect(res.status).toBe(401);
    });
});
