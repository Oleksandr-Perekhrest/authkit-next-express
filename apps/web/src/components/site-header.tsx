"use client";

// outsource dependencies
import Link from "next/link";
import { useState } from "react";
import { useRouter, usePathname } from "next/navigation";

// local dependencies
import { useAuth } from "@/components/auth-provider";

export default function SiteHeader() {
    const router = useRouter();
    const pathname = usePathname();
    const { status, logout } = useAuth();
    const [logoutPending, setLogoutPending] = useState(false);
    const [logoutError, setLogoutError] = useState<string | null>(null);

    async function handleLogout() {
        setLogoutPending(true);
        setLogoutError(null);
        try {
            await logout();
            router.replace("/");
        } catch (err) {
            setLogoutError(
                err instanceof Error ? err.message : "Logout failed",
            );
        } finally {
            setLogoutPending(false);
        }
    }

    function navLink(href: string, label: string) {
        const active = pathname === href;
        return (
            <Link
                href={href}
                className={active ? "underline" : "hover:underline"}
            >
                {label}
            </Link>
        );
    }

    return (
        <header className="border-b border-neutral-200/80 bg-linear-to-r from-indigo-100/90 via-white/90 to-sky-100/90 backdrop-blur-sm dark:border-neutral-700/80 dark:from-indigo-950/90 dark:via-neutral-900/90 dark:to-sky-950/90">
            {" "}
            <div className="flex items-center justify-between px-4 py-3 text-sm">
                {navLink("/", "Home")}
                <div className="flex items-center gap-4">
                    {status === "loading" && (
                        <div className="h-4 w-28 animate-pulse rounded bg-neutral-200 dark:bg-neutral-700" />
                    )}
                    {status === "anonymous" && (
                        <>
                            {navLink("/login", "Log in")}
                            {navLink("/register", "Register")}
                        </>
                    )}
                    {status === "authenticated" && (
                        <>
                            {navLink("/profile", "Profile")}
                            {logoutError && (
                                <p className="text-red-600 dark:text-red-400">
                                    {logoutError}
                                </p>
                            )}
                            <button
                                type="button"
                                onClick={handleLogout}
                                disabled={logoutPending}
                                className="hover:underline disabled:cursor-not-allowed disabled:opacity-50"
                            >
                                {logoutPending ? "Logging out…" : "Log out"}
                            </button>
                        </>
                    )}
                </div>
            </div>
        </header>
    );
}
