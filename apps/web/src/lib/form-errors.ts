// outsource dependencies
import { z } from "zod";
import type { FieldPath, FieldValues, UseFormSetError } from "react-hook-form";

// local dependencies
import { ApiError } from "@/lib/api-client";

const validationDetailsSchema = z.object({
    formErrors: z.array(z.string()),
    fieldErrors: z.record(z.string(), z.array(z.string())),
});

type ApplyApiErrorOptions<T extends FieldValues> = {
    fields: readonly FieldPath<T>[];
    codeMap: Record<string, FieldPath<T> | "root">;
};

export function applyApiError<T extends FieldValues>(
    err: unknown,
    setError: UseFormSetError<T>,
    options: ApplyApiErrorOptions<T>,
): boolean {
    if (!(err instanceof ApiError)) {
        return false;
    }

    const mapped = options.codeMap[err.code];
    if (mapped !== undefined) {
        setError(mapped, { message: err.message });
        return true;
    }

    if (err.code === "VALIDATION_ERROR") {
        const parsed = validationDetailsSchema.safeParse(err.details);
        if (!parsed.success) {
            return false;
        }
        const { formErrors, fieldErrors } = parsed.data;
        const knownFields = new Set<string>(options.fields);
        const rootMessages: string[] = [];
        for (const [field, messages] of Object.entries(fieldErrors)) {
            const first = messages[0];
            if (first === undefined) continue;
            if (knownFields.has(field)) {
                setError(field as FieldPath<T>, { message: first });
            } else {
                rootMessages.push(first);
            }
        }
        rootMessages.push(...formErrors);
        if (rootMessages.length > 0) {
            setError("root", { message: rootMessages[0] });
        }
        return true;
    }

    return false;
}
