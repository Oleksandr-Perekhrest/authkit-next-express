// outsource dependencies
import { it, expect, describe } from "vitest";
import { AUTH_TOAST_CODES, GOOGLE_AUTH_ERRORS } from "@authkit/shared";

// local dependencies
import { toastMessages, isAuthToastCode } from "./toast-messages";

describe("toastMessages", () => {
    it("google_created has type 'success'", () => {
        expect(toastMessages["google_created"].type).toBe("success");
    });

    it("google_login has type 'success'", () => {
        expect(toastMessages["google_login"].type).toBe("success");
    });

    it("google_created has the expected message", () => {
        expect(toastMessages["google_created"].message).toBe(
            "Account created with Google",
        );
    });

    it("google_login has the expected message", () => {
        expect(toastMessages["google_login"].message).toBe(
            "Logged in with Google",
        );
    });

    it("every AUTH_TOAST_CODE is present as a key", () => {
        for (const code of AUTH_TOAST_CODES) {
            expect(toastMessages).toHaveProperty(code);
        }
    });

    it("all GOOGLE_AUTH_ERRORS have type 'error'", () => {
        for (const code of Object.values(GOOGLE_AUTH_ERRORS)) {
            expect(toastMessages[code].type).toBe("error");
        }
    });

    it("every entry has a non-empty message string", () => {
        for (const { message } of Object.values(toastMessages)) {
            expect(message.length).toBeGreaterThan(0);
        }
    });
});

describe("isAuthToastCode", () => {
    it("returns true for every known AUTH_TOAST_CODE", () => {
        for (const code of AUTH_TOAST_CODES) {
            expect(isAuthToastCode(code)).toBe(true);
        }
    });

    it("returns false for an unknown string", () => {
        expect(isAuthToastCode("unknown_code")).toBe(false);
    });

    it("returns false for null", () => {
        expect(isAuthToastCode(null)).toBe(false);
    });

    it("returns false for an empty string", () => {
        expect(isAuthToastCode("")).toBe(false);
    });

    it("returns false for a close-but-not-exact match", () => {
        expect(isAuthToastCode("google_created_")).toBe(false);
    });
});
