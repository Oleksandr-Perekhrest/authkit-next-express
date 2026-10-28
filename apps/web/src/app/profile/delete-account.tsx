"use client";

// outsource dependencies
import { toast } from "sonner";
import { useRef, useState } from "react";
import { useRouter } from "next/navigation";

// local dependencies
import { apiFetch } from "@/lib/api-client";
import { useAuth } from "@/components/auth-provider";

export default function DeleteAccount() {
    const router = useRouter();
    const { clearUser } = useAuth();
    const dialogRef = useRef<HTMLDialogElement>(null);
    const [pending, setPending] = useState(false);

    function openDialog() {
        dialogRef.current?.showModal();
    }

    function closeDialog() {
        dialogRef.current?.close();
    }

    async function handleDelete() {
        setPending(true);
        try {
            await apiFetch("/users/me", { method: "DELETE" });
            clearUser();
            toast.success("Account deleted");
            router.replace("/");
        } catch {
            dialogRef.current?.close();
            toast.error("Something went wrong. Please try again.");
            setPending(false);
        }
    }

    return (
        <>
            <button
                type="button"
                onClick={openDialog}
                className="w-full rounded border border-red-300 py-2 text-sm font-medium text-red-600 hover:bg-red-50 dark:border-red-700 dark:text-red-400 dark:hover:bg-red-950/30"
            >
                Delete account
            </button>

            <dialog
                ref={dialogRef}
                aria-labelledby="delete-dialog-title"
                aria-describedby="delete-dialog-desc"
                className="w-full max-w-sm rounded-xl border border-neutral-200 bg-white p-6 text-neutral-900 shadow-lg backdrop:bg-black/50 dark:border-neutral-700 dark:bg-neutral-900 dark:text-neutral-100"
            >
                <h2 id="delete-dialog-title" className="text-lg font-semibold">
                    Delete account
                </h2>
                <p
                    id="delete-dialog-desc"
                    className="mt-2 text-sm text-neutral-600 dark:text-neutral-400"
                >
                    This permanently deletes your account and all sessions. This
                    action cannot be undone.
                </p>
                <div className="mt-6 flex justify-end gap-3">
                    <button
                        type="button"
                        autoFocus
                        onClick={closeDialog}
                        disabled={pending}
                        className="rounded border border-neutral-300 px-4 py-2 text-sm font-medium text-neutral-700 hover:bg-neutral-50 disabled:cursor-not-allowed disabled:opacity-50 dark:border-neutral-600 dark:text-neutral-200 dark:hover:bg-neutral-800"
                    >
                        Cancel
                    </button>
                    <button
                        type="button"
                        onClick={handleDelete}
                        disabled={pending}
                        className="rounded bg-red-600 px-4 py-2 text-sm font-medium text-white hover:bg-red-700 disabled:cursor-not-allowed disabled:opacity-50"
                    >
                        {pending ? "Deleting…" : "Delete"}
                    </button>
                </div>
            </dialog>
        </>
    );
}
