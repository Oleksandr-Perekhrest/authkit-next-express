// outsource dependencies
import type { AuthToastCode } from "@authkit/shared";
import { AUTH_TOAST_CODES, GOOGLE_AUTH_ERRORS } from "@authkit/shared";

export const toastMessages: Record<
    AuthToastCode,
    { type: "success" | "error"; message: string }
> = {
    google_created: { type: "success", message: "Account created with Google" },
    google_login: { type: "success", message: "Logged in with Google" },
    [GOOGLE_AUTH_ERRORS.failed]: {
        type: "error",
        message: "Google sign-in failed. Please try again.",
    },
    [GOOGLE_AUTH_ERRORS.cancelled]: {
        type: "error",
        message: "Google sign-in was cancelled.",
    },
    [GOOGLE_AUTH_ERRORS.invalid_state]: {
        type: "error",
        message: "Your sign-in session expired. Please try again.",
    },
    [GOOGLE_AUTH_ERRORS.email_unverified]: {
        type: "error",
        message: "Your Google email address is not verified.",
    },
    [GOOGLE_AUTH_ERRORS.account_exists]: {
        type: "error",
        message:
            "An account with this email already exists. Log in with your password.",
    },
};

export function isAuthToastCode(value: string | null): value is AuthToastCode {
    return (
        value !== null &&
        (AUTH_TOAST_CODES as readonly string[]).includes(value)
    );
}
