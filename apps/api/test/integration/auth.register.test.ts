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

describe("POST /auth/register", () => {
    beforeEach(async () => {
        await truncateAll();
    });

    it("returns 201, sets httpOnly auth cookies, and stores a hashed password", async () => {
        const res = await request(app).post("/auth/register").send({
            email: "alice@example.com",
            password: "password123",
            name: "Alice",
        });

        expect(res.status).toBe(201);
        expect(res.body).toMatchObject({
            user: { email: "alice@example.com", name: "Alice" },
        });

        const rawCookies = res.headers["set-cookie"] as string | string[];
        const cookies = Array.isArray(rawCookies) ? rawCookies : [rawCookies];

        const accessCookie = cookies.find((c) => c.startsWith("access_token="));
        const refreshCookie = cookies.find((c) =>
            c.startsWith("refresh_token="),
        );

        expect(accessCookie).toBeDefined();
        expect(refreshCookie).toBeDefined();
        expect(accessCookie).toMatch(/HttpOnly/i);
        expect(refreshCookie).toMatch(/HttpOnly/i);

        const { rows } = await pool.query<{
            email: string;
            passwordHash: string;
        }>('SELECT email, "passwordHash" FROM "User" WHERE email = $1', [
            "alice@example.com",
        ]);
        expect(rows).toHaveLength(1);
        const row = rows[0]!;
        expect(row.email).toBe("alice@example.com");
        expect(row.passwordHash).not.toBe("password123");
        expect(row.passwordHash).toMatch(/^\$argon2/);
    });

    it("returns 409 on duplicate email", async () => {
        await request(app)
            .post("/auth/register")
            .send({ email: "dupe@example.com", password: "password123" });

        const res = await request(app)
            .post("/auth/register")
            .send({ email: "dupe@example.com", password: "password456" });

        expect(res.status).toBe(409);
        expect(res.body.error.code).toBe("EMAIL_TAKEN");
    });

    it("returns 400 on invalid body", async () => {
        const res = await request(app)
            .post("/auth/register")
            .send({ email: "not-an-email", password: "short" });

        expect(res.status).toBe(400);
        expect(res.body.error.code).toBe("VALIDATION_ERROR");
    });
});
