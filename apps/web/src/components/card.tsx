// outsource dependencies
import type { ReactNode } from "react";

// local dependencies
import { cn } from "@/lib/cn";

type Variant = "home" | "login" | "register" | "profile";

const variantClasses: Record<Variant, string> = {
    home: "bg-linear-to-br from-white/70 to-blue-50/80 dark:from-neutral-900/70 dark:to-blue-950/50",
    login: "bg-linear-to-br from-white/70 to-violet-50/80 dark:from-neutral-900/70 dark:to-violet-950/50",
    register:
        "bg-linear-to-br from-white/70 to-emerald-50/80 dark:from-neutral-900/70 dark:to-emerald-950/50",
    profile:
        "bg-linear-to-br from-white/70 to-amber-50/80 dark:from-neutral-900/70 dark:to-amber-950/50",
};

type Props = {
    title?: string;
    variant?: Variant;
    children: ReactNode;
};

export default function Card({ title, variant, children }: Props) {
    return (
        <div
            className={cn(
                "w-full max-w-sm space-y-6 rounded-xl border border-white/60 p-6 shadow-sm backdrop-blur-sm dark:border-neutral-700/60",
                variant
                    ? variantClasses[variant]
                    : "bg-white/70 dark:bg-neutral-900/70",
            )}
        >
            {title && <h1 className="text-2xl font-semibold">{title}</h1>}
            {children}
        </div>
    );
}
