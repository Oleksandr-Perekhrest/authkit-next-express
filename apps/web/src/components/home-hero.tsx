"use client";

// outsource dependencies
import { Mail, User, Globe, ShieldCheck, ArrowUpRight } from "lucide-react";

// local dependencies
import { cn } from "@/lib/cn";
import { useAuth } from "@/components/auth-provider";
import Button, { ButtonLink } from "@/components/button";

const features = [
    {
        icon: Mail,
        title: "Email & password",
        description:
            "Sign up and log in with email; passwords are securely hashed and input is validated on both sides.",
    },
    {
        icon: Globe,
        title: "Google sign-in",
        description: "One-click sign-in with your Google account.",
    },
    {
        icon: ShieldCheck,
        title: "Secure sessions",
        description:
            "Short-lived access tokens with silent refresh; a reused refresh token revokes the whole session.",
    },
    {
        icon: User,
        title: "Your profile",
        description: "Edit your display name or delete your account.",
    },
];

const stack = [
    "Next.js 16",
    "React 19",
    "Tailwind CSS v4",
    "Express 5",
    "Prisma",
    "PostgreSQL",
    "Zod",
    "Vercel",
    "Render",
];

const cardClass =
    "rounded-xl border border-white/60 bg-white/70 p-4 shadow-sm backdrop-blur-sm dark:border-neutral-700/60 dark:bg-neutral-900/70";

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
        <div className="flex w-full max-w-2xl flex-col items-center gap-6 text-center">
            <h1 className="text-5xl font-bold tracking-tight">AuthKit</h1>

            <p className="max-w-2xl text-balance text-lg text-neutral-600 dark:text-neutral-400">
                A full-stack authentication demo: email &amp; password, Google
                sign-in and secure sessions.
            </p>

            <div className="flex flex-col items-center gap-3">
                <div className="flex gap-3">
                    <ButtonLink href="/register" className="px-4">
                        Create account
                    </ButtonLink>
                    <ButtonLink variant="outline" href="/login">
                        Log in
                    </ButtonLink>
                </div>
                <a
                    href="https://github.com/Oleksandr-Perekhrest/authkit-next-express"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center gap-1 text-sm text-neutral-500 hover:text-neutral-700 dark:text-neutral-400 dark:hover:text-neutral-200"
                >
                    View source on GitHub
                    <ArrowUpRight className="h-3.5 w-3.5" />
                </a>
            </div>

            <div className="grid w-full grid-cols-1 gap-3 text-left sm:grid-cols-2">
                {features.map(({ icon: Icon, title, description }) => (
                    <div key={title} className={cardClass}>
                        <div className="mb-2 flex items-center gap-1.5">
                            <Icon className="h-3.5 w-3.5 shrink-0 text-blue-600 dark:text-blue-400" />
                            <h2 className="text-sm font-semibold">{title}</h2>
                        </div>
                        <p className="text-xs text-neutral-600 dark:text-neutral-400">
                            {description}
                        </p>
                    </div>
                ))}
            </div>

            <div className="flex flex-wrap justify-center gap-2">
                {stack.map((tech) => (
                    <span
                        key={tech}
                        className={cn(
                            "rounded-full border px-2.5 py-0.5 text-xs",
                            "border-neutral-200 bg-neutral-100 text-neutral-600",
                            "dark:border-neutral-700 dark:bg-neutral-800 dark:text-neutral-400",
                        )}
                    >
                        {tech}
                    </span>
                ))}
            </div>
        </div>
    );
}
