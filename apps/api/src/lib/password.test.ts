// outsource dependencies
import { it, expect, describe } from "vitest";

// local dependencies
import { hashPassword, verifyPassword } from "./password";

describe("hashPassword", () => {
    it("produces a hash different from the plain password", async () => {
        const hash = await hashPassword("mypassword");
        expect(hash).not.toBe("mypassword");
    });

    it("produces a different hash for the same password on each call (salt)", async () => {
        const hash1 = await hashPassword("mypassword");
        const hash2 = await hashPassword("mypassword");
        expect(hash1).not.toBe(hash2);
    });
});

describe("verifyPassword", () => {
    it("returns true for the correct password", async () => {
        const hash = await hashPassword("correct-password");
        expect(await verifyPassword(hash, "correct-password")).toBe(true);
    });

    it("returns false for a wrong password", async () => {
        const hash = await hashPassword("correct-password");
        expect(await verifyPassword(hash, "wrong-password")).toBe(false);
    });
});
