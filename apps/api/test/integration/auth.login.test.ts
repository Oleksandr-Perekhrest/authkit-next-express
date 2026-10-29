// outsource dependencies
import request from "supertest";
import { it, expect, afterAll, describe, beforeEach } from "vitest";

// local dependencies
import { createApp } from "../../src/app";
import { closeDb, truncateAll } from "../helpers/db";

const app = createApp();
const USER = { email: "user@example.com", password: "password123" };

afterAll(() => closeDb());

describe("POST /auth/login", () => {
    beforeEach(async () => {
        await truncateAll();
        await request(app).post("/auth/register").send(USER).expect(201);
    });

    it("returns 200 and sets auth cookies on success", async () => {
        const res = await request(app).post("/auth/login").send(USER);

        expect(res.status).toBe(200);
        expect(res.body).toMatchObject({ user: { email: USER.email } });

        const cookies = res.headers["set-cookie"] as unknown as string[];
        expect(
            cookies.find((c) => c.startsWith("access_token=")),
        ).toBeDefined();
        expect(
            cookies.find((c) => c.startsWith("refresh_token=")),
        ).toBeDefined();
    });

    it("returns the same status and error body for wrong password and unknown email", async () => {
        const wrongPass = await request(app)
            .post("/auth/login")
            .send({ email: USER.email, password: "wrongpassword" });
        const unknownEmail = await request(app)
            .post("/auth/login")
            .send({ email: "nobody@example.com", password: USER.password });

        expect(wrongPass.status).toBe(401);
        expect(unknownEmail.status).toBe(401);
        expect(wrongPass.body.error.code).toBe("INVALID_CREDENTIALS");
        expect(unknownEmail.body.error.code).toBe("INVALID_CREDENTIALS");
        expect(wrongPass.body.error.message).toBe(
            unknownEmail.body.error.message,
        );
    });

    it("returns 400 on invalid body", async () => {
        const res = await request(app)
            .post("/auth/login")
            .send({ email: "not-an-email" });

        expect(res.status).toBe(400);
        expect(res.body.error.code).toBe("VALIDATION_ERROR");
    });
});
