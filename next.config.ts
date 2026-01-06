import type { NextConfig } from "next";
import { initOpenNextCloudflareForDev } from "@opennextjs/cloudflare";

initOpenNextCloudflareForDev();

const nextConfig: NextConfig = {
    eslint: {
        ignoreDuringBuilds: true,
    },
    typescript: {
        ignoreBuildErrors: true,
    },
    images: {
        remotePatterns: [
            {
                protocol: "https",
                hostname: "pub-1aa7bb22d4509ba4b29cfc9418424695.r2.dev",
                port: "",
                pathname: "/**",
            },
            {
                protocol: "https",
                hostname: "cdn.discordapp.com",
                port: "",
                pathname: "/**",
            },
            {
                protocol: "https",
                hostname: "raw.githubusercontent.com",
                port: "",
                pathname: "/**",
            },
        ],
    },
    webpack: (config, { isServer }) => {
        config.resolve.alias = {
            ...config.resolve.alias,
            "@solana/web3.js": require.resolve("@solana/web3.js"),
        };
        config.resolve.fallback = {
            ...config.resolve.fallback,
            "zlib-sync": false,
            "bufferutil": false,
            "utf-8-validate": false,
        };
        return config;
    },
};

export default nextConfig;
