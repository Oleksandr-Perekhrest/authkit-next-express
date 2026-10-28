"use client";

// outsource dependencies
import Link from "next/link";

// local dependencies
import { useAuth } from "@/components/auth-provider";

const primaryBtn =
    "rounded bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700";

const secondaryBtn =
    "rounded border border-neutral-300 px-4 py-2 text-sm font-medium hover:bg-neutral-50 dark:border-neutral-600 dark:hover:bg-neutral-800";

export default function HomeHero() {
    const { status, user, reload } = useAuth();

    if (status === "loading") {
        return (
            <div className="flex w-full max-w-lg flex-col items-center gap-6 text-center">
                <div className="h-10 w-3/4 animate-pulse rounded-lg bg-neutral-200 dark:bg-neutral-700" />
                <div className="flex w-full flex-col gap-2">
                    <div className="h-5 w-full animate-pulse rounded bg-neutral-200 dark:bg-neutral-700" />
                    <div className="mx-auto h-5 w-5/6 animate-pulse rounded bg-neutral-200 dark:bg-neutral-700" />
                </div>
                <div className="flex gap-3">
                    <div className="h-9 w-32 animate-pulse rounded bg-neutral-200 dark:bg-neutral-700" />
                    <div className="h-9 w-20 animate-pulse rounded bg-neutral-200 dark:bg-neutral-700" />
                </div>
            </div>
        );
    }

    if (status === "error") {
        return (
            <div className="flex max-w-lg flex-col items-center gap-6 text-center">
                <p className="text-neutral-600 dark:text-neutral-400">
                    Could not load your session.
                </p>
                <button type="button" onClick={reload} className={primaryBtn}>
                    Try again
                </button>
            </div>
        );
    }

    if (status === "authenticated" && user) {
        return (
            <div className="flex max-w-lg flex-col items-center gap-6 text-center">
                <h1 className="text-4xl font-bold tracking-tight">
                    Welcome back, {user.name ?? user.email}
                </h1>
                <p className="text-lg text-neutral-600 dark:text-neutral-400">
                    You&apos;re signed in and ready to go.
                </p>
                <Link href="/profile" className={primaryBtn}>
                    Go to profile
                </Link>
            </div>
        );
    }

    return (
        <div className="flex max-w-lg flex-col items-center gap-6 text-center">
            <h1 className="text-4xl font-bold tracking-tight">
                Welcome to AuthKit
            </h1>
            <p className="text-lg text-neutral-600 dark:text-neutral-400">
                A minimal example of JWT authentication with Next.js 16 and
                Express 5.
            </p>
            <div className="flex gap-3">
                <Link href="/register" className={primaryBtn}>
                    Create account
                </Link>
                <Link href="/login" className={secondaryBtn}>
                    Log in
                </Link>
            </div>
        </div>
    );
}
