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

function cookieVal(cookies: string[], name: string): string | undefined {
    return cookies
        .find((c) => c.startsWith(`${name}=`))
        ?.split("=")?.[1]
        ?.split(";")?.[0];
}

// The grace window is computed from revokedAt, so backdating that column simulates
// time passing without touching source code or fake timers.
async function backdateRevokedAt(seconds: number): Promise<void> {
    await pool.query(
        `UPDATE "RefreshToken"
         SET "revokedAt" = "revokedAt" - ($1 * INTERVAL '1 second')
         WHERE "revokedAt" IS NOT NULL`,
        [seconds],
    );
}

const USER = { email: "user@example.com", password: "password123" };

describe("POST /auth/refresh — reuse detection", () => {
    beforeEach(() => truncateAll());

    it("inside the grace window: returns 409 REFRESH_CONFLICT and leaves the current session alive", async () => {
        const agent = request.agent(app);
        const regRes = await agent
            .post("/auth/register")
            .send(USER)
            .expect(201);
        const t1 = cookieVal(
            regRes.headers["set-cookie"] as unknown as string[],
            "refresh_token",
        )!;

        // Rotate T1 → T2; T1.revokedAt is set to now
        await agent.post("/auth/refresh").expect(204);

        // Reuse T1 immediately — well within the 10 s grace window
        const reuseRes = await request(app)
            .post("/auth/refresh")
            .set("Cookie", `refresh_token=${t1}`);
        expect(reuseRes.status).toBe(409);
        expect(reuseRes.body.error.code).toBe("REFRESH_CONFLICT");

        // No revocation: the current session (T2) must still be alive
        expect((await agent.get("/auth/me")).status).toBe(200);
    });

    it("outside the grace window: revokes the family and blocks all holders of the rotated token", async () => {
        const agent = request.agent(app);
        const regRes = await agent
            .post("/auth/register")
            .send(USER)
            .expect(201);
        const t1 = cookieVal(
            regRes.headers["set-cookie"] as unknown as string[],
            "refresh_token",
        )!;

        const rotRes = await agent.post("/auth/refresh").expect(204);
        const t2 = cookieVal(
            rotRes.headers["set-cookie"] as unknown as string[],
            "refresh_token",
        )!;

        // Independent second session in a separate family — only the compromised family is revoked by design.
        const agent2 = request.agent(app);
        await agent2.post("/auth/login").send(USER).expect(200);

        // Backdate T1.revokedAt by 11 s — past the 10 s grace window
        await backdateRevokedAt(11);

        // Reuse T1 → triggers family revocation
        const reuseRes = await request(app)
            .post("/auth/refresh")
            .set("Cookie", `refresh_token=${t1}`);
        expect(reuseRes.status).toBe(401);
        expect(reuseRes.body.error.code).toBe("UNAUTHENTICATED");

        // The session holder (agent with T2 in jar) can no longer refresh
        expect((await agent.post("/auth/refresh")).status).toBe(401);

        // A second holder of T2 (simulates a concurrent/stolen token) also fails
        expect(
            (
                await request(app)
                    .post("/auth/refresh")
                    .set("Cookie", `refresh_token=${t2}`)
            ).status,
        ).toBe(401);

        // The independent session's family was not touched — it must still work
        expect((await agent2.post("/auth/refresh")).status).toBe(204);
    });

    it("revocation is scoped to the token family — another user's sessions are unaffected", async () => {
        const agentA = request.agent(app);
        const regResA = await agentA
            .post("/auth/register")
            .send(USER)
            .expect(201);
        const t1A = cookieVal(
            regResA.headers["set-cookie"] as unknown as string[],
            "refresh_token",
        )!;

        const agentB = request.agent(app);
        await agentB
            .post("/auth/register")
            .send({ email: "other@example.com", password: "password123" })
            .expect(201);

        // Rotate T1_A so it has a revokedAt; T1_B stays active
        await agentA.post("/auth/refresh").expect(204);
        await backdateRevokedAt(11); // only T1_A has revokedAt set

        // Reuse T1_A → revokes user A's token family
        expect(
            (
                await request(app)
                    .post("/auth/refresh")
                    .set("Cookie", `refresh_token=${t1A}`)
            ).status,
        ).toBe(401);

        // User B's session is in a separate family and must remain valid
        expect((await agentB.post("/auth/refresh")).status).toBe(204);
    });
});
