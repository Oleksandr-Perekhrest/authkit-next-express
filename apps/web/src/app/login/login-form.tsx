"use client";

// outsource dependencies
import Link from "next/link";
import { useForm } from "react-hook-form";
import { useRouter } from "next/navigation";
import { loginSchema } from "@authkit/shared";
import { zodResolver } from "@hookform/resolvers/zod";
import type { LoginInput, UserResponse } from "@authkit/shared";

// local dependencies
import { apiFetch } from "@/lib/api-client";
import { applyApiError } from "@/lib/form-errors";

export default function LoginForm() {
    const router = useRouter();
    const {
        register,
        handleSubmit,
        setError,
        formState: { errors, isSubmitting },
    } = useForm<LoginInput>({ resolver: zodResolver(loginSchema) });

    async function onSubmit(data: LoginInput) {
        try {
            await apiFetch<UserResponse>("/auth/login", {
                method: "POST",
                body: JSON.stringify(data),
            });
            router.replace("/profile");
        } catch (err) {
            applyApiError(err, setError, {
                fields: ["email", "password"],
                codeMap: { INVALID_CREDENTIALS: "root", RATE_LIMITED: "root" },
            });
        }
    }

    return (
        <form onSubmit={handleSubmit(onSubmit)} noValidate>
            <div>
                <label htmlFor="email">Email</label>
                <input
                    id="email"
                    type="email"
                    autoComplete="email"
                    aria-invalid={!!errors.email || undefined}
                    aria-describedby={errors.email ? "email-error" : undefined}
                    {...register("email")}
                />
                {errors.email && (
                    <p id="email-error" role="alert">
                        {errors.email.message}
                    </p>
                )}
            </div>
            <div>
                <label htmlFor="password">Password</label>
                <input
                    id="password"
                    type="password"
                    autoComplete="current-password"
                    aria-invalid={!!errors.password || undefined}
                    aria-describedby={
                        errors.password ? "password-error" : undefined
                    }
                    {...register("password")}
                />
                {errors.password && (
                    <p id="password-error" role="alert">
                        {errors.password.message}
                    </p>
                )}
            </div>
            {errors.root && <p role="alert">{errors.root.message}</p>}
            <button type="submit" disabled={isSubmitting}>
                {isSubmitting ? "Logging in…" : "Log in"}
            </button>
            <p>
                Don&apos;t have an account?{" "}
                <Link href="/register">Register</Link>
            </p>
        </form>
    );
}
