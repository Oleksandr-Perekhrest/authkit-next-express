// outsource dependencies
import { SignJWT } from "jose";
import { it, vi, expect, describe, afterEach } from "vitest";

// local dependencies
import {
    signAccessToken,
    hashRefreshToken,
    verifyAccessToken,
    generateRefreshToken,
    ACCESS_TOKEN_TTL_SECONDS,
} from "./tokens";

describe("signAccessToken / verifyAccessToken", () => {
    it("sign then verify returns the expected userId", async () => {
        const token = await signAccessToken("user-123");
        const result = await verifyAccessToken(token);
        expect(result.userId).toBe("user-123");
    });

    it("rejects a token signed with a different secret", async () => {
        const otherSecret = new TextEncoder().encode("a".repeat(32));
        const token = await new SignJWT()
            .setProtectedHeader({ alg: "HS256" })
            .setSubject("user-123")
            .setIssuedAt()
            .setExpirationTime("15m")
            .sign(otherSecret);
        await expect(verifyAccessToken(token)).rejects.toThrow();
    });

    it("rejects a tampered token", async () => {
        const token = await signAccessToken("user-123");
        const [header, payload, sig] = token.split(".");
        const decoded = JSON.parse(
            Buffer.from(payload!, "base64url").toString(),
        ) as Record<string, unknown>;
        decoded["sub"] = "attacker";
        const tamperedPayload = Buffer.from(JSON.stringify(decoded)).toString(
            "base64url",
        );
        const tampered = `${header}.${tamperedPayload}.${sig}`;
        await expect(verifyAccessToken(tampered)).rejects.toThrow();
    });

    it("rejects a raw refresh token (opaque bytes, not a JWT)", async () => {
        const { token } = generateRefreshToken();
        await expect(verifyAccessToken(token)).rejects.toThrow();
    });
});

describe("token expiry", () => {
    afterEach(() => vi.useRealTimers());

    it("rejects an expired access token", async () => {
        vi.useFakeTimers();
        const token = await signAccessToken("user-123");
        vi.setSystemTime(Date.now() + (ACCESS_TOKEN_TTL_SECONDS + 1) * 1000);
        await expect(verifyAccessToken(token)).rejects.toThrow();
    });
});

describe("hashRefreshToken", () => {
    it("is deterministic — same input produces the same hash", () => {
        expect(hashRefreshToken("abc")).toBe(hashRefreshToken("abc"));
    });

    it("differs from the raw token", () => {
        const raw = "some-raw-token";
        expect(hashRefreshToken(raw)).not.toBe(raw);
    });

    it("produces a sha256 hex string (64 characters)", () => {
        expect(hashRefreshToken("test")).toMatch(/^[0-9a-f]{64}$/);
    });
});

describe("generateRefreshToken", () => {
    it("returns a token and a matching hash", () => {
        const { token, tokenHash } = generateRefreshToken();
        expect(tokenHash).toBe(hashRefreshToken(token));
    });

    it("generates distinct tokens on each call", () => {
        const { token: a } = generateRefreshToken();
        const { token: b } = generateRefreshToken();
        expect(a).not.toBe(b);
    });
});
