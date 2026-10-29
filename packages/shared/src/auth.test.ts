// outsource dependencies
import { it, expect, describe } from "vitest";

// local dependencies
import {
    nameSchema,
    loginSchema,
    registerSchema,
    PASSWORD_MAX_LENGTH,
    PASSWORD_MIN_LENGTH,
} from "./auth";

describe("nameSchema", () => {
    it("accepts a valid name", () => {
        expect(nameSchema.safeParse("Alice").success).toBe(true);
    });

    it("trims whitespace and still passes", () => {
        const result = nameSchema.safeParse("  Alice  ");
        expect(result.success).toBe(true);
        if (result.success) expect(result.data).toBe("Alice");
    });

    it("accepts a name at max length", () => {
        expect(nameSchema.safeParse("a".repeat(100)).success).toBe(true);
    });

    it("rejects an empty string", () => {
        expect(nameSchema.safeParse("").success).toBe(false);
    });

    it("rejects a name that is only whitespace", () => {
        expect(nameSchema.safeParse("   ").success).toBe(false);
    });

    it("rejects a name exceeding max length", () => {
        expect(nameSchema.safeParse("a".repeat(101)).success).toBe(false);
    });
});

describe("registerSchema", () => {
    const valid = { email: "user@example.com", password: "password123" };

    it("accepts valid email and password", () => {
        expect(registerSchema.safeParse(valid).success).toBe(true);
    });

    it("accepts valid input with optional name", () => {
        expect(
            registerSchema.safeParse({ ...valid, name: "Alice" }).success,
        ).toBe(true);
    });

    it("accepts input without name (name is optional)", () => {
        expect(registerSchema.safeParse(valid).success).toBe(true);
    });

    it("rejects an invalid email", () => {
        const result = registerSchema.safeParse({
            ...valid,
            email: "notanemail",
        });
        expect(result.success).toBe(false);
        if (!result.success)
            expect(result.error.issues[0]?.path[0]).toBe("email");
    });

    it("rejects a password shorter than the minimum", () => {
        const result = registerSchema.safeParse({
            ...valid,
            password: "a".repeat(PASSWORD_MIN_LENGTH - 1),
        });
        expect(result.success).toBe(false);
        if (!result.success)
            expect(result.error.issues[0]?.path[0]).toBe("password");
    });

    it("rejects a password longer than the maximum", () => {
        const result = registerSchema.safeParse({
            ...valid,
            password: "a".repeat(PASSWORD_MAX_LENGTH + 1),
        });
        expect(result.success).toBe(false);
        if (!result.success)
            expect(result.error.issues[0]?.path[0]).toBe("password");
    });

    it("rejects an empty name when name is provided", () => {
        const result = registerSchema.safeParse({ ...valid, name: "" });
        expect(result.success).toBe(false);
        if (!result.success)
            expect(result.error.issues[0]?.path[0]).toBe("name");
    });
});

describe("loginSchema", () => {
    const valid = { email: "user@example.com", password: "any-password" };

    it("accepts valid email and password", () => {
        expect(loginSchema.safeParse(valid).success).toBe(true);
    });

    it("rejects an invalid email", () => {
        const result = loginSchema.safeParse({ ...valid, email: "bad" });
        expect(result.success).toBe(false);
        if (!result.success)
            expect(result.error.issues[0]?.path[0]).toBe("email");
    });

    it("rejects an empty password", () => {
        const result = loginSchema.safeParse({ ...valid, password: "" });
        expect(result.success).toBe(false);
        if (!result.success)
            expect(result.error.issues[0]?.path[0]).toBe("password");
    });

    it("accepts a one-character password", () => {
        expect(loginSchema.safeParse({ ...valid, password: "x" }).success).toBe(
            true,
        );
    });
});

describe("email normalization", () => {
    it("lowercases the email in registerSchema", () => {
        const result = registerSchema.safeParse({
            email: "USER@EXAMPLE.COM",
            password: "password123",
        });
        expect(result.success).toBe(true);
        if (result.success) expect(result.data.email).toBe("user@example.com");
    });

    it("trims whitespace from email in registerSchema", () => {
        const result = registerSchema.safeParse({
            email: "  user@example.com  ",
            password: "password123",
        });
        expect(result.success).toBe(true);
        if (result.success) expect(result.data.email).toBe("user@example.com");
    });

    it("trims and lowercases email in registerSchema together", () => {
        const result = registerSchema.safeParse({
            email: "  USER@EXAMPLE.COM  ",
            password: "password123",
        });
        expect(result.success).toBe(true);
        if (result.success) expect(result.data.email).toBe("user@example.com");
    });

    it("lowercases the email in loginSchema", () => {
        const result = loginSchema.safeParse({
            email: "USER@EXAMPLE.COM",
            password: "password",
        });
        expect(result.success).toBe(true);
        if (result.success) expect(result.data.email).toBe("user@example.com");
    });

    it("trims whitespace from email in loginSchema", () => {
        const result = loginSchema.safeParse({
            email: "  user@example.com  ",
            password: "password",
        });
        expect(result.success).toBe(true);
        if (result.success) expect(result.data.email).toBe("user@example.com");
    });
});
