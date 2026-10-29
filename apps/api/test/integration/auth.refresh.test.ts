// outsource dependencies
import request from "supertest";
import { it, expect, afterAll, describe, beforeEach } from "vitest";

// local dependencies
import { createApp } from "../../src/app";
import { registerAgent } from "../helpers/auth";
import { closeDb, truncateAll } from "../helpers/db";

const app = createApp();

afterAll(() => closeDb());

function cookieVal(cookies: string[], name: string): string | undefined {
    return cookies
        .find((c) => c.startsWith(`${name}=`))
        ?.split("=")?.[1]
        ?.split(";")?.[0];
}

describe("POST /auth/refresh", () => {
    beforeEach(() => truncateAll());

    it("returns 204 and issues new cookies; refresh token differs from the old one", async () => {
        const agent = request.agent(app);
        const regRes = await agent
            .post("/auth/register")
            .send({ email: "user@example.com", password: "password123" })
            .expect(201);

        const oldRefresh = cookieVal(
            regRes.headers["set-cookie"] as unknown as string[],
            "refresh_token",
        );

        const refreshRes = await agent.post("/auth/refresh");
        expect(refreshRes.status).toBe(204);

        const newRefresh = cookieVal(
            refreshRes.headers["set-cookie"] as unknown as string[],
            "refresh_token",
        );
        expect(newRefresh).toBeDefined();
        expect(newRefresh).not.toBe(oldRefresh);
    });

    it("/auth/me succeeds with the new access token after rotation", async () => {
        const agent = await registerAgent(app);
        await agent.post("/auth/refresh").expect(204);
        const res = await agent.get("/auth/me");
        expect(res.status).toBe(200);
    });

    it("returns 401 without a refresh cookie", async () => {
        const res = await request(app).post("/auth/refresh");
        expect(res.status).toBe(401);
    });
});
