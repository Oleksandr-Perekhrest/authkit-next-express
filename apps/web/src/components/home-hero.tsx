"use client";

// local dependencies
import { useAuth } from "@/components/auth-provider";
import Button, { ButtonLink } from "@/components/button";

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
                <Button type="button" onClick={reload} className="px-4">
                    Try again
                </Button>
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
                <ButtonLink href="/profile" className="px-4">
                    Go to profile
                </ButtonLink>
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
            {/*<p className="text-lg text-neutral-600 dark:text-neutral-400"></p>*/}
            <div className="flex gap-3">
                <ButtonLink href="/register" className="px-4">
                    Create account
                </ButtonLink>
                <ButtonLink variant="outline" href="/login">
                    Log in
                </ButtonLink>
            </div>
        </div>
    );
}
