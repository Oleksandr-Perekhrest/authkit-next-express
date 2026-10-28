"use client";

// outsource dependencies
import { toast } from "sonner";
import { useEffect } from "react";
import { useRouter, usePathname, useSearchParams } from "next/navigation";

// local dependencies
import { toastMessages, isAuthToastCode } from "@/lib/toast-messages";

export default function UrlToast() {
    const router = useRouter();
    const pathname = usePathname();
    const searchParams = useSearchParams();
    const toastCode = searchParams.get("toast");

    useEffect(() => {
        if (!toastCode) return;

        if (isAuthToastCode(toastCode)) {
            const { type, message } = toastMessages[toastCode];
            if (type === "success") {
                toast.success(message, { id: toastCode });
            } else {
                toast.error(message, { id: toastCode });
            }
        }

        const next = new URLSearchParams(searchParams.toString());
        next.delete("toast");
        const qs = next.toString();
        router.replace(`${pathname}${qs ? `?${qs}` : ""}`, { scroll: false });
    }, [toastCode, pathname, router, searchParams]);

    return null;
}
