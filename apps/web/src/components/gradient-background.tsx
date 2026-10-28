type Variant = "home" | "login" | "register" | "profile";

type VariantConfig = {
    base: string;
    shape1: string;
    shape2: string;
};

const variants: Record<Variant, VariantConfig> = {
    home: {
        base: "bg-linear-to-br from-slate-50 to-blue-50 dark:from-neutral-950 dark:to-blue-950",
        shape1: "absolute -top-32 left-1/4 h-96 w-96 rounded-full bg-blue-300/40 blur-3xl dark:bg-blue-600/20",
        shape2: "absolute -bottom-32 right-1/4 h-96 w-96 rounded-full bg-indigo-300/40 blur-3xl dark:bg-indigo-600/20",
    },
    login: {
        base: "bg-linear-to-bl from-slate-50 to-violet-50 dark:from-neutral-950 dark:to-violet-950",
        shape1: "absolute -top-32 right-1/4 h-96 w-96 rounded-full bg-violet-300/40 blur-3xl dark:bg-violet-600/20",
        shape2: "absolute -bottom-32 left-1/4 h-96 w-96 rounded-full bg-purple-300/40 blur-3xl dark:bg-purple-600/20",
    },
    register: {
        base: "bg-linear-to-tr from-slate-50 to-emerald-50 dark:from-neutral-950 dark:to-emerald-950",
        shape1: "absolute -top-24 left-1/3 h-80 w-80 rounded-full bg-emerald-300/40 blur-3xl dark:bg-emerald-600/20",
        shape2: "absolute -bottom-24 right-1/3 h-80 w-80 rounded-full bg-teal-300/40 blur-3xl dark:bg-teal-600/20",
    },
    profile: {
        base: "bg-linear-to-tl from-slate-50 to-amber-50 dark:from-neutral-950 dark:to-amber-950",
        shape1: "absolute -top-40 right-1/3 h-96 w-96 rounded-full bg-amber-300/40 blur-3xl dark:bg-amber-600/20",
        shape2: "absolute -bottom-24 left-1/4 h-80 w-80 rounded-full bg-rose-300/40 blur-3xl dark:bg-rose-600/20",
    },
};

type Props = { variant: Variant };

export default function GradientBackground({ variant }: Props) {
    const { base, shape1, shape2 } = variants[variant];
    return (
        <div
            aria-hidden="true"
            className={`pointer-events-none absolute inset-0 -z-10 overflow-hidden ${base}`}
        >
            <div className={shape1} />
            <div className={shape2} />
        </div>
    );
}
