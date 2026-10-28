"use client";

// outsource dependencies
import { useState } from "react";
import { useForm } from "react-hook-form";
import { updateProfileSchema } from "@authkit/shared";
import { zodResolver } from "@hookform/resolvers/zod";
import { X, Save, Pencil, Trash2 } from "lucide-react";
import type { UserResponse, UpdateProfileInput } from "@authkit/shared";

// local dependencies
import { applyApiError } from "@/lib/form-errors";
import { useAuth } from "@/components/auth-provider";
import { ApiError, apiFetch } from "@/lib/api-client";

type Props = { user: UserResponse["user"] };

export default function EditNameForm({ user }: Props) {
    const { setUser, clearUser } = useAuth();
    const [editing, setEditing] = useState(false);
    const {
        register,
        handleSubmit,
        setError,
        reset,
        watch,
        formState: { errors, isSubmitting },
    } = useForm<UpdateProfileInput>({
        resolver: zodResolver(updateProfileSchema),
        defaultValues: { name: user.name ?? "" },
    });

    const value = watch("name");
    const isEmpty = !value?.trim();

    function handleCancel() {
        reset({ name: user.name ?? "" });
        setEditing(false);
    }

    async function onSubmit(data: UpdateProfileInput) {
        try {
            const response = await apiFetch<UserResponse>("/users/me", {
                method: "PATCH",
                body: JSON.stringify(data),
            });
            setUser(response.user);
            reset({ name: response.user.name ?? "" });
            setEditing(false);
        } catch (err) {
            if (err instanceof ApiError && err.status === 401) {
                clearUser();
                return;
            }
            applyApiError(err, setError, { fields: ["name"], codeMap: {} });
        }
    }

    if (!editing) {
        return (
            <div className="flex flex-col gap-1">
                <p className="text-sm font-medium">Name</p>
                <div className="flex items-center gap-1.5">
                    <p className="text-sm">{user.name ?? "No name"}</p>
                    <button
                        type="button"
                        aria-label="Edit name"
                        title="Edit name"
                        onClick={() => setEditing(true)}
                        className="rounded p-0.5 text-neutral-400 hover:text-neutral-600 focus:outline-hidden focus:ring-2 focus:ring-blue-500 dark:text-neutral-500 dark:hover:text-neutral-300"
                    >
                        <Pencil size={14} />
                    </button>
                </div>
            </div>
        );
    }

    return (
        <form
            onSubmit={handleSubmit(onSubmit)}
            noValidate
            className="flex flex-col gap-1"
        >
            <p className="text-sm font-medium">Name</p>
            <div className="flex items-center gap-1">
                <input
                    autoFocus
                    type="text"
                    className="min-w-0 flex-1 rounded border border-neutral-300 bg-white px-2 py-1 text-sm outline-hidden focus:ring-2 focus:ring-blue-500 dark:border-neutral-600 dark:bg-neutral-800"
                    {...register("name", {
                        setValueAs: (v: string) => (v.trim() === "" ? null : v),
                    })}
                    onKeyDown={(e) => {
                        if (e.key === "Escape") {
                            e.preventDefault();
                            handleCancel();
                        }
                    }}
                />
                <button
                    type="submit"
                    aria-label={isEmpty ? "Remove name" : "Save name"}
                    title={isEmpty ? "Remove name" : "Save name"}
                    disabled={isSubmitting}
                    className={
                        isEmpty
                            ? "rounded p-1 text-red-500 hover:text-red-700 focus:outline-hidden focus:ring-2 focus:ring-red-500 disabled:cursor-not-allowed disabled:opacity-50"
                            : "rounded p-1 text-blue-600 hover:text-blue-800 focus:outline-hidden focus:ring-2 focus:ring-blue-500 disabled:cursor-not-allowed disabled:opacity-50"
                    }
                >
                    {isEmpty ? <Trash2 size={16} /> : <Save size={16} />}
                </button>
                <button
                    type="button"
                    aria-label="Cancel"
                    title="Cancel"
                    disabled={isSubmitting}
                    onClick={handleCancel}
                    className="rounded p-1 text-neutral-400 hover:text-neutral-600 focus:outline-hidden focus:ring-2 focus:ring-blue-500 disabled:cursor-not-allowed disabled:opacity-50 dark:text-neutral-500 dark:hover:text-neutral-300"
                >
                    <X size={16} />
                </button>
            </div>
            {errors.name && (
                <p
                    role="alert"
                    className="text-xs text-red-600 dark:text-red-400"
                >
                    {errors.name.message}
                </p>
            )}
            {errors.root && (
                <p
                    role="alert"
                    className="text-xs text-red-600 dark:text-red-400"
                >
                    {errors.root.message}
                </p>
            )}
        </form>
    );
}
