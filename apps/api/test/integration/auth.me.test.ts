// outsource dependencies
import request from "supertest";
import { it, expect, afterAll, describe, beforeEach } from "vitest";

// local dependencies
import { createApp } from "../../src/app";
import { closeDb, truncateAll } from "../helpers/db";
import { DEFAULT_USER, registerAgent } from "../helpers/auth";

const app = createApp();

afterAll(() => closeDb());

describe("GET /auth/me", () => {
    beforeEach(() => truncateAll());

    it("returns the current user when valid cookies are set", async () => {
        const agent = await registerAgent(app);
        const res = await agent.get("/auth/me");

        expect(res.status).toBe(200);
        expect(res.body).toMatchObject({ user: { email: DEFAULT_USER.email } });
        expect(res.body.user).not.toHaveProperty("passwordHash");
        expect(res.body.user).not.toHaveProperty("password");
    });

    it("returns 401 without cookies", async () => {
        const res = await request(app).get("/auth/me");
        expect(res.status).toBe(401);
    });
});
