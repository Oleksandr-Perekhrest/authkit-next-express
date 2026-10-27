"use client";

// outsource dependencies
import Link from "next/link";
import { useForm } from "react-hook-form";
import { useRouter } from "next/navigation";
import { registerSchema } from "@authkit/shared";
import { zodResolver } from "@hookform/resolvers/zod";
import type { UserResponse, RegisterInput } from "@authkit/shared";

// local dependencies
import { apiFetch } from "@/lib/api-client";
import { applyApiError } from "@/lib/form-errors";

export default function RegisterForm() {
    const router = useRouter();
    const {
        register,
        setError,
        handleSubmit,
        formState: { errors, isSubmitting },
    } = useForm<RegisterInput>({ resolver: zodResolver(registerSchema) });

    async function onSubmit(data: RegisterInput) {
        try {
            await apiFetch<UserResponse>("/auth/register", {
                method: "POST",
                body: JSON.stringify(data),
            });
            router.replace("/profile");
        } catch (err) {
            applyApiError(err, setError, {
                fields: ["name", "email", "password"],
                codeMap: { EMAIL_TAKEN: "email", RATE_LIMITED: "root" },
            });
        }
    }

    return (
        <form onSubmit={handleSubmit(onSubmit)} noValidate>
            <div>
                <label htmlFor="name">Name</label>
                <input
                    id="name"
                    type="text"
                    autoComplete="name"
                    aria-invalid={!!errors.name || undefined}
                    aria-describedby={errors.name ? "name-error" : undefined}
                    {...register("name", {
                        setValueAs: (value: string) =>
                            value.trim() === "" ? undefined : value,
                    })}
                />
                {errors.name && (
                    <p id="name-error" role="alert">
                        {errors.name.message}
                    </p>
                )}
            </div>
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
                    autoComplete="new-password"
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
                {isSubmitting ? "Registering…" : "Register"}
            </button>
            <p>
                Already have an account? <Link href="/login">Log in</Link>
            </p>
        </form>
    );
}
