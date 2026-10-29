// outsource dependencies
import { it, expect, afterAll, describe, beforeEach } from "vitest";

// local dependencies
import { createApp } from "../../src/app";
import { closeDb, truncateAll } from "../helpers/db";
import { loginAgent, registerAgent } from "../helpers/auth";

const app = createApp();

afterAll(() => closeDb());

describe("POST /auth/logout-all", () => {
    beforeEach(() => truncateAll());

    it("invalidates all active sessions so refresh fails for every agent", async () => {
        const agent1 = await registerAgent(app);
        const agent2 = await loginAgent(app);

        await agent1.post("/auth/logout-all").expect(204);

        expect((await agent1.post("/auth/refresh")).status).toBe(401);
        expect((await agent2.post("/auth/refresh")).status).toBe(401);
    });
});
