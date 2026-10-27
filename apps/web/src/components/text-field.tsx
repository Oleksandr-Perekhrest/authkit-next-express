// outsource dependencies
import type { ComponentPropsWithRef } from "react";

type TextFieldProps = ComponentPropsWithRef<"input"> & {
    label: string;
    id: string;
    error?: string;
};

export default function TextField({
    label,
    id,
    error,
    ...inputProps
}: TextFieldProps) {
    return (
        <div className="flex flex-col gap-1">
            <label htmlFor={id} className="text-sm font-medium">
                {label}
            </label>
            <input
                {...inputProps}
                id={id}
                aria-invalid={error ? true : undefined}
                aria-describedby={error ? `${id}-error` : undefined}
                className="w-full rounded border border-neutral-300 bg-white px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-blue-500 aria-invalid:border-red-500 dark:border-neutral-600 dark:bg-neutral-800"
            />
            {error && (
                <p
                    id={`${id}-error`}
                    role="alert"
                    className="text-sm text-red-600 dark:text-red-400"
                >
                    {error}
                </p>
            )}
        </div>
    );
}
