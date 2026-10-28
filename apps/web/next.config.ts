// outsource dependencies
import type { NextConfig } from "next";

const apiUrl = process.env.API_URL ?? "http://localhost:4000";

const nextConfig: NextConfig = {
    transpilePackages: ["@authkit/shared"],
    experimental: {
        agentFeedback: true,
    },
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

export default nextConfig;
