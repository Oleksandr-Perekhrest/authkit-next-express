"use client";

// outsource dependencies
import { useEffect } from "react";

// local dependencies
import { trackRequest } from "@/lib/request-tracker";

export default function WarmUpPing() {
    useEffect(() => {
        const done = trackRequest();
        fetch("/api/health").finally(done);
    }, []);

    return null;
}
