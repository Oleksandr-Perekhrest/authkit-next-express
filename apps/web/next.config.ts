// outsource dependencies
import type { NextConfig } from "next";
import { PHASE_PRODUCTION_BUILD } from "next/constants";

export default function config(phase: string): NextConfig {
    const apiUrl = process.env.API_URL || "http://localhost:4000";

    if (phase === PHASE_PRODUCTION_BUILD) {
        const raw = process.env.API_URL;
        const valid =
            !!raw &&
            URL.canParse(raw) &&
            /^https?:$/.test(new URL(raw).protocol);
        if (!valid) {
            throw new Error(
                "API_URL is required for production builds and must be a valid absolute URL " +
                    "(e.g. https://api.example.com) — set it in your environment or .env.local",
            );
        }
    }

    return {
        transpilePackages: ["@authkit/shared"],
        turbopack: {
            rules: {
                "*.css": {
                    loaders: ["@tailwindcss/turbopack"],
                    as: "*.css",
                },
            },
        },
        async rewrites() {
            return [
                {
                    source: "/api/:path*",
                    destination: `${apiUrl}/:path*`,
                },
            ];
        },
    };
}
