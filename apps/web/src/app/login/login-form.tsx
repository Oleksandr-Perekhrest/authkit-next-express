"use client";

// outsource dependencies
import Link from "next/link";
import { toast } from "sonner";
import { useForm } from "react-hook-form";
import { useRouter } from "next/navigation";
import { loginSchema } from "@authkit/shared";
import { zodResolver } from "@hookform/resolvers/zod";
import type { LoginInput, UserResponse } from "@authkit/shared";

// local dependencies
import Button from "@/components/button";
import { apiFetch } from "@/lib/api-client";
import TextField from "@/components/text-field";
import { applyApiError } from "@/lib/form-errors";
import { useAuth } from "@/components/auth-provider";
import GoogleSignInButton from "@/components/google-sign-in-button";

export default function LoginForm() {
    const router = useRouter();
    const { setUser } = useAuth();
    const {
        register,
        handleSubmit,
        setError,
        formState: { errors, isSubmitting },
    } = useForm<LoginInput>({ resolver: zodResolver(loginSchema) });

    async function onSubmit(data: LoginInput) {
        try {
            const response = await apiFetch<UserResponse>("/auth/login", {
                method: "POST",
                body: JSON.stringify(data),
            });
            setUser(response.user);
            toast.success("Logged in");
            router.replace("/profile");
        } catch (err) {
            if (
                !applyApiError(err, setError, {
                    fields: ["email", "password"],
                    codeMap: {
                        INVALID_CREDENTIALS: "root",
                        RATE_LIMITED: "root",
                    },
                })
            ) {
                toast.error("Something went wrong. Please try again.");
            }
        }
    }

    return (
        <form
            onSubmit={handleSubmit(onSubmit)}
            noValidate
            className="flex flex-col gap-4"
        >
            <TextField
                label="Email"
                id="email"
                type="email"
                autoComplete="email"
                error={errors.email?.message}
                {...register("email")}
            />
            <TextField
                label="Password"
                id="password"
                type="password"
                autoComplete="current-password"
                error={errors.password?.message}
                {...register("password")}
            />
            {errors.root && (
                <p
                    role="alert"
                    className="text-sm text-red-600 dark:text-red-400"
                >
                    {errors.root.message}
                </p>
            )}
            <Button type="submit" disabled={isSubmitting} className="w-full">
                {isSubmitting ? "Logging in…" : "Log in"}
            </Button>
            <div className="flex items-center gap-3">
                <div className="h-px flex-1 bg-neutral-200 dark:bg-neutral-700" />
                <span className="text-sm text-neutral-500">or</span>
                <div className="h-px flex-1 bg-neutral-200 dark:bg-neutral-700" />
            </div>
            <GoogleSignInButton />
            <p className="text-center text-sm">
                Don&apos;t have an account?{" "}
                <Link href="/register" className="underline">
                    Register
                </Link>
            </p>
        </form>
    );
}
