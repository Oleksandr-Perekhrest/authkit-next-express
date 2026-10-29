// outsource dependencies
import type { ReactNode } from "react";

type Props = {
    title?: string;
    children: ReactNode;
};

export default function Card({ title, children }: Props) {
    return (
        <div className="w-full max-w-sm space-y-6 rounded-xl border border-white/60 bg-white/70 p-6 shadow-sm backdrop-blur-sm dark:border-neutral-700/60 dark:bg-neutral-900/70">
            {title && <h1 className="text-2xl font-semibold">{title}</h1>}
            {children}
        </div>
    );
}
