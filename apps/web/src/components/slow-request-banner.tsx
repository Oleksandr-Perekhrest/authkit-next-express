"use client";

// outsource dependencies
import { useSyncExternalStore } from "react";

// local dependencies
import { WAKEUP_MESSAGE, requestTrackerStore } from "@/lib/request-tracker";

export default function SlowRequestBanner() {
    const slowCount = useSyncExternalStore(
        requestTrackerStore.subscribe,
        requestTrackerStore.getSnapshot,
        () => 0,
    );

    return (
        <div
            role="status"
            aria-live="polite"
            className="fixed bottom-4 left-1/2 z-50 -translate-x-1/2"
        >
            {slowCount > 0 && (
                <div className="flex items-center gap-2 rounded-full bg-white px-4 py-2 text-sm text-neutral-700 shadow-lg ring-1 ring-neutral-200 dark:bg-neutral-900 dark:text-neutral-300 dark:ring-neutral-700">
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
                    {WAKEUP_MESSAGE}
                </div>
            )}
        </div>
    );
}
