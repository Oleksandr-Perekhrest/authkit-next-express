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
import TextField from "@/components/text-field";
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
        <form
            onSubmit={handleSubmit(onSubmit)}
            noValidate
            className="flex flex-col gap-4"
        >
            <TextField
                label="Name"
                id="name"
                type="text"
                autoComplete="name"
                error={errors.name?.message}
                {...register("name", {
                    setValueAs: (value: string) =>
                        value.trim() === "" ? undefined : value,
                })}
            />
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
                autoComplete="new-password"
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
            <button
                type="submit"
                disabled={isSubmitting}
                className="w-full rounded bg-blue-600 py-2 text-sm font-medium text-white hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-50"
            >
                {isSubmitting ? "Registering…" : "Register"}
            </button>
            <p className="text-center text-sm">
                Already have an account?{" "}
                <Link href="/login" className="underline">
                    Log in
                </Link>
            </p>
        </form>
    );
}
