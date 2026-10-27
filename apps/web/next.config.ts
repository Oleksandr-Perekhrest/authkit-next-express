// outsource dependencies
import type { NextConfig } from "next";

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
};

export default nextConfig;
