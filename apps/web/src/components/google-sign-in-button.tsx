"use client";

// outsource dependencies
import { useRef, useState, useEffect } from "react";

// local dependencies
import GoogleIcon from "@/components/google-icon";
import { WAKEUP_MESSAGE } from "@/lib/request-tracker";

export default function GoogleSignInButton() {
    const [pending, setPending] = useState(false);
    const [slow, setSlow] = useState(false);
    const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

    useEffect(() => {
        function handlePageShow(event: PageTransitionEvent) {
            if (!event.persisted) return;
            setPending(false);
            setSlow(false);
            if (timerRef.current !== null) {
                clearTimeout(timerRef.current);
                timerRef.current = null;
            }
        }
        window.addEventListener("pageshow", handlePageShow);
        return () => {
            window.removeEventListener("pageshow", handlePageShow);
            if (timerRef.current !== null) clearTimeout(timerRef.current);
        };
    }, []);

    function handleClick(event: React.MouseEvent<HTMLAnchorElement>) {
        if (pending) {
            event.preventDefault();
            return;
        }
        setPending(true);
        timerRef.current = setTimeout(() => {
            setSlow(true);
            timerRef.current = null;
        }, 3000);
    }

    return (
        <div>
            <a
                href="/api/auth/google"
                onClick={handleClick}
                aria-busy={pending}
                className={`flex w-full items-center justify-center gap-2.5 rounded border border-neutral-300 px-3 py-2 text-sm font-medium text-neutral-700 hover:bg-neutral-50 dark:border-neutral-600 dark:text-neutral-200 dark:hover:bg-neutral-800${pending ? " cursor-wait opacity-75" : ""}`}
            >
                {pending ? (
                    <svg
                        aria-hidden
                        viewBox="0 0 24 24"
                        fill="none"
                        className="h-4 w-4 shrink-0 animate-spin motion-reduce:animate-none"
                    >
                        <circle
                            cx="12"
                            cy="12"
                            r="10"
                            stroke="currentColor"
                            strokeWidth="4"
                            className="opacity-25"
                        />
                        <path
                            fill="currentColor"
                            className="opacity-75"
                            d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"
                        />
                    </svg>
                ) : (
                    <GoogleIcon />
                )}
                {pending ? "Redirecting to Google…" : "Continue with Google"}
            </a>
            {slow && (
                <p className="mt-2 text-center text-xs text-neutral-500 dark:text-neutral-400">
                    {WAKEUP_MESSAGE}
                </p>
            )}
        </div>
    );
}
