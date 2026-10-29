"use client";

// outsource dependencies
import Link from "next/link";
import type { ComponentPropsWithoutRef } from "react";

// local dependencies
import { cn } from "@/lib/cn";

const variants = {
    primary:
        "rounded bg-blue-600 py-2 text-sm font-medium text-white hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-50",
    outline:
        "rounded border border-neutral-300 px-4 py-2 text-sm font-medium hover:bg-neutral-50 disabled:cursor-not-allowed disabled:opacity-50 dark:border-neutral-600 dark:hover:bg-neutral-800",
    icon: "rounded p-1 focus:outline-hidden focus:ring-2 focus:ring-blue-500 disabled:cursor-not-allowed disabled:opacity-50",
} as const;

type Variant = keyof typeof variants;

type ButtonProps = ComponentPropsWithoutRef<"button"> & {
    variant?: Variant;
};

export default function Button({
    variant = "primary",
    className,
    ...props
}: ButtonProps) {
    return <button className={cn(variants[variant], className)} {...props} />;
}

type ButtonLinkProps = ComponentPropsWithoutRef<typeof Link> & {
    variant?: Variant;
};

export function ButtonLink({
    variant = "primary",
    className,
    ...props
}: ButtonLinkProps) {
    return <Link className={cn(variants[variant], className)} {...props} />;
}
