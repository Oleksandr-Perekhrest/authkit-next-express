"use client";

// outsource dependencies
import { useRouter } from "next/navigation";
import { useState, useEffect } from "react";
import type { UserResponse } from "@authkit/shared";

// local dependencies
import { ApiError, apiFetch } from "@/lib/api-client";

type State =
    | { status: "loading" }
    | { status: "error"; message: string }
    | { status: "success"; user: UserResponse["user"] };

export default function ProfileView() {
    const router = useRouter();
    const [state, setState] = useState<State>({ status: "loading" });
    const [retryCount, setRetryCount] = useState(0);
    const [logoutError, setLogoutError] = useState<string | null>(null);
    const [logoutPending, setLogoutPending] = useState(false);

    useEffect(() => {
        let ignore = false;
        async function fetchUser() {
            try {
                const { user } = await apiFetch<UserResponse>("/auth/me");
                if (!ignore) setState({ status: "success", user });
            } catch (err) {
                if (ignore) return;
                if (err instanceof ApiError && err.status === 401) {
                    router.replace("/login");
                    return;
                }
                setState({
                    status: "error",
                    message:
                        err instanceof Error
                            ? err.message
                            : "Something went wrong",
                });
            }
        }
        void fetchUser();
        return () => {
            ignore = true;
        };
    }, [retryCount, router]);

    function retry() {
        setState({ status: "loading" });
        setRetryCount((c) => c + 1);
    }

    async function handleLogout() {
        setLogoutError(null);
        setLogoutPending(true);
        try {
            await apiFetch("/auth/logout", { method: "POST" });
            router.replace("/login");
        } catch (err) {
            setLogoutError(
                err instanceof Error ? err.message : "Logout failed",
            );
            setLogoutPending(false);
        }
    }

    if (state.status === "loading") {
        return <p className="text-sm text-neutral-500">Loading…</p>;
    }

    if (state.status === "error") {
        return (
            <div className="flex flex-col gap-4">
                <p
                    role="alert"
                    className="text-sm text-red-600 dark:text-red-400"
                >
                    {state.message}
                </p>
                <button
                    type="button"
                    onClick={retry}
                    className="w-full rounded bg-blue-600 py-2 text-sm font-medium text-white hover:bg-blue-700"
                >
                    Try again
                </button>
            </div>
        );
    }

    const { user } = state;
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
            {logoutError && (
                <p
                    role="alert"
                    className="text-sm text-red-600 dark:text-red-400"
                >
                    {logoutError}
                </p>
            )}
            <button
                type="button"
                onClick={handleLogout}
                disabled={logoutPending}
                className="w-full rounded bg-blue-600 py-2 text-sm font-medium text-white hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-50"
            >
                {logoutPending ? "Logging out…" : "Log out"}
            </button>
        </div>
    );
}
