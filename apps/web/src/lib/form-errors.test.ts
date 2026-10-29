// outsource dependencies
import type { UseFormSetError } from "react-hook-form";
import { vi, it, expect, describe, beforeEach } from "vitest";

// local dependencies
import { ApiError } from "@/lib/api-client";
import { applyApiError } from "./form-errors";

type TestForm = { email: string; name: string };

const mockSetError = vi.fn();
const setError = mockSetError as unknown as UseFormSetError<TestForm>;
const options = {
    fields: ["email", "name"] as const,
    codeMap: {
        EMAIL_TAKEN: "email" as const,
        RATE_LIMIT: "root" as const,
    },
};

beforeEach(() => mockSetError.mockClear());

describe("non-ApiError inputs", () => {
    it("returns false for a generic Error", () => {
        expect(applyApiError(new Error("oops"), setError, options)).toBe(false);
    });

    it("returns false for null", () => {
        expect(applyApiError(null, setError, options)).toBe(false);
    });

    it("returns false for a plain object", () => {
        expect(applyApiError({ message: "x" }, setError, options)).toBe(false);
    });

    it("never calls setError for non-ApiError inputs", () => {
        applyApiError(new Error("x"), setError, options);
        applyApiError(null, setError, options);
        expect(mockSetError).not.toHaveBeenCalled();
    });
});

describe("code mapped via codeMap", () => {
    it("calls setError with the mapped field and returns true", () => {
        const err = new ApiError(400, "EMAIL_TAKEN", "Email already in use");
        expect(applyApiError(err, setError, options)).toBe(true);
        expect(mockSetError).toHaveBeenCalledOnce();
        expect(mockSetError).toHaveBeenCalledWith("email", {
            message: "Email already in use",
        });
    });

    it("calls setError with root when codeMap maps to 'root'", () => {
        const err = new ApiError(429, "RATE_LIMIT", "Too many requests");
        expect(applyApiError(err, setError, options)).toBe(true);
        expect(mockSetError).toHaveBeenCalledWith("root", {
            message: "Too many requests",
        });
    });
});

describe("unmapped codes", () => {
    it("returns false and does not call setError", () => {
        const err = new ApiError(500, "INTERNAL_ERROR", "Server error");
        expect(applyApiError(err, setError, options)).toBe(false);
        expect(mockSetError).not.toHaveBeenCalled();
    });
});

describe("VALIDATION_ERROR", () => {
    it("sets an error for a known field", () => {
        const err = new ApiError(400, "VALIDATION_ERROR", "Validation failed", {
            formErrors: [],
            fieldErrors: { email: ["Invalid email"] },
        });
        expect(applyApiError(err, setError, options)).toBe(true);
        expect(mockSetError).toHaveBeenCalledWith("email", {
            message: "Invalid email",
        });
    });

    it("uses only the first message for a known field", () => {
        const err = new ApiError(400, "VALIDATION_ERROR", "Validation failed", {
            formErrors: [],
            fieldErrors: { email: ["first", "second"] },
        });
        applyApiError(err, setError, options);
        expect(mockSetError).toHaveBeenCalledOnce();
        expect(mockSetError).toHaveBeenCalledWith("email", {
            message: "first",
        });
    });

    it("routes unknown field errors to root", () => {
        const err = new ApiError(400, "VALIDATION_ERROR", "Validation failed", {
            formErrors: [],
            fieldErrors: { unknownField: ["Bad value"] },
        });
        expect(applyApiError(err, setError, options)).toBe(true);
        expect(mockSetError).toHaveBeenCalledWith("root", {
            message: "Bad value",
        });
    });

    it("routes formErrors to root", () => {
        const err = new ApiError(400, "VALIDATION_ERROR", "Validation failed", {
            formErrors: ["Form-level error"],
            fieldErrors: {},
        });
        expect(applyApiError(err, setError, options)).toBe(true);
        expect(mockSetError).toHaveBeenCalledWith("root", {
            message: "Form-level error",
        });
    });

    it("separates known and unknown fields, both set their respective errors", () => {
        const err = new ApiError(400, "VALIDATION_ERROR", "Validation failed", {
            formErrors: [],
            fieldErrors: {
                email: ["Invalid email"],
                unknownField: ["Bad value"],
            },
        });
        applyApiError(err, setError, options);
        expect(mockSetError).toHaveBeenCalledWith("email", {
            message: "Invalid email",
        });
        expect(mockSetError).toHaveBeenCalledWith("root", {
            message: "Bad value",
        });
        expect(mockSetError).toHaveBeenCalledTimes(2);
    });

    it("uses only the first accumulated root message", () => {
        const err = new ApiError(400, "VALIDATION_ERROR", "Validation failed", {
            formErrors: ["second", "third"],
            fieldErrors: { unknownField: ["first"] },
        });
        applyApiError(err, setError, options);
        expect(mockSetError).toHaveBeenCalledOnce();
        expect(mockSetError).toHaveBeenCalledWith("root", { message: "first" });
    });

    it("skips field entries with an empty messages array", () => {
        const err = new ApiError(400, "VALIDATION_ERROR", "Validation failed", {
            formErrors: [],
            fieldErrors: { email: [] },
        });
        expect(applyApiError(err, setError, options)).toBe(true);
        expect(mockSetError).not.toHaveBeenCalled();
    });

    it("returns true even when details contain no errors", () => {
        const err = new ApiError(400, "VALIDATION_ERROR", "Validation failed", {
            formErrors: [],
            fieldErrors: {},
        });
        expect(applyApiError(err, setError, options)).toBe(true);
        expect(mockSetError).not.toHaveBeenCalled();
    });

    it("returns false when details are a malformed value", () => {
        const err = new ApiError(
            400,
            "VALIDATION_ERROR",
            "Validation failed",
            "not-an-object",
        );
        expect(applyApiError(err, setError, options)).toBe(false);
        expect(mockSetError).not.toHaveBeenCalled();
    });

    it("returns false when details are missing", () => {
        const err = new ApiError(400, "VALIDATION_ERROR", "Validation failed");
        expect(applyApiError(err, setError, options)).toBe(false);
        expect(mockSetError).not.toHaveBeenCalled();
    });
});
