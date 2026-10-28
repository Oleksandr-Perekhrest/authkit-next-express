// outsource dependencies
import type { Metadata } from "next";
import { GOOGLE_AUTH_ERRORS } from "@authkit/shared";

// local dependencies
import LoginForm from "./login-form";
import GradientBackground from "@/components/gradient-background";

export const metadata: Metadata = { title: "Log in" };

const googleErrorMessages: Record<string, string> = {
    [GOOGLE_AUTH_ERRORS.failed]: "Google sign-in failed. Please try again.",
    [GOOGLE_AUTH_ERRORS.cancelled]: "Google sign-in was cancelled.",
    [GOOGLE_AUTH_ERRORS.invalid_state]:
        "Your sign-in session expired. Please try again.",
    [GOOGLE_AUTH_ERRORS.email_unverified]:
        "Your Google email address is not verified.",
    [GOOGLE_AUTH_ERRORS.account_exists]:
        "An account with this email already exists. Log in with your password.",
};

export default async function LoginPage({
    searchParams,
}: {
    searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
}) {
    const { error } = await searchParams;
    const errorCode = typeof error === "string" ? error : undefined;
    const googleError = errorCode
        ? (googleErrorMessages[errorCode] ?? null)
        : null;

    return (
        <main className="relative isolate flex flex-1 overflow-hidden">
            <GradientBackground variant="login" />
            <div className="flex flex-1 items-center justify-center px-4 py-16">
                <div className="w-full max-w-sm space-y-6 rounded-xl border border-white/60 bg-white/70 p-6 shadow-sm backdrop-blur-sm dark:border-neutral-700/60 dark:bg-neutral-900/70">
                    <h1 className="text-2xl font-semibold">Log in</h1>
                    <LoginForm googleError={googleError} />
                </div>
            </div>
        </main>
    );
}
