"use client";

// outsource dependencies
import Link from "next/link";

// local dependencies
import { useAuth } from "@/components/auth-provider";

export default function ProfileView() {
    const { status, user, reload } = useAuth();

    if (status === "loading") {
        return <p className="text-sm text-neutral-500">Loading…</p>;
    }

    if (status === "error") {
        return (
            <div className="flex flex-col gap-4">
                <p
                    role="alert"
                    className="text-sm text-red-600 dark:text-red-400"
                >
                    Something went wrong
                </p>
                <button
                    type="button"
                    onClick={reload}
                    className="w-full rounded bg-blue-600 py-2 text-sm font-medium text-white hover:bg-blue-700"
                >
                    Try again
                </button>
            </div>
        );
    }

    if (status === "anonymous" || !user) {
        return (
            <p className="text-sm">
                You are logged out.{" "}
                <Link href="/login" className="underline">
                    Log in
                </Link>
            </p>
        );
    }

    return (
        <div className="flex flex-col gap-4">
            <div className="flex flex-col gap-1">
                <p className="text-sm font-medium">Name</p>
                <p className="text-sm">{user.name ?? "No name"}</p>
            </div>
            <div className="flex flex-col gap-1">
                <p className="text-sm font-medium">Email</p>
                <p className="text-sm">{user.email}</p>
            </div>
            <div className="flex flex-col gap-1">
                <p className="text-sm font-medium">Member since</p>
                <p className="text-sm">
                    {new Date(user.createdAt).toLocaleDateString(undefined, {
                        year: "numeric",
                        month: "long",
                        day: "numeric",
                    })}
                </p>
            </div>
        </div>
    );
}
