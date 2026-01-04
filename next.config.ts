import type { NextConfig } from "next";
import path from "path";

const nextConfig: NextConfig = {
    eslint: {
        ignoreDuringBuilds: true,
    },
    typescript: {
        ignoreBuildErrors: true,
    },
    // turbopack: {
    // },
    // output: 'standalone',
    // outputFileTracingRoot: path.join(__dirname, '../'),
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
        // Fix for discord.js peer dependencies in Next.js (Global)
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
