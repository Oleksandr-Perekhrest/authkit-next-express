// outsource dependencies
import request from "supertest";
import type { Express } from "express";

export type Agent = ReturnType<typeof request.agent>;

export interface TestUser {
    email: string;
    password: string;
    name?: string;
}

export const DEFAULT_USER: TestUser = {
    email: "user@example.com",
    password: "password123",
    name: "Test User",
};

export async function registerAgent(
    app: Express,
    user: TestUser = DEFAULT_USER,
): Promise<Agent> {
    const agent = request.agent(app);
    await agent.post("/auth/register").send(user).expect(201);
    return agent;
}

export async function loginAgent(
    app: Express,
    user: TestUser = DEFAULT_USER,
): Promise<Agent> {
    const agent = request.agent(app);
    await agent
        .post("/auth/login")
        .send({ email: user.email, password: user.password })
        .expect(200);
    return agent;
}
