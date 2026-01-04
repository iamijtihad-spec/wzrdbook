"use client";

import { useWallet } from "@solana/wallet-adapter-react";
import { ReactNode } from "react";
import Link from "next/link";
import WalletButton from "@/components/WalletButton";

// Admin wallet addresses - add your admin wallets here
// For testing, leave empty to allow all connected wallets
const ADMIN_WALLETS: string[] = [
    // Add admin wallet addresses here
    // Example: "YOUR_ADMIN_WALLET_ADDRESS"
];

export default function AdminLayout({ children }: { children: ReactNode }) {
    const { publicKey, connected } = useWallet();

    // Allow all connected wallets if ADMIN_WALLETS is empty (for testing)
    const isAdmin = publicKey && (
        ADMIN_WALLETS.length === 0 ||
        ADMIN_WALLETS.includes(publicKey.toBase58())
    );

    if (!connected) {
        return (
            <div className="min-h-screen bg-gradient-to-br from-gray-900 via-purple-900 to-black flex items-center justify-center">
                <div className="text-center p-8 bg-gray-800/50 rounded-2xl border border-purple-500/30 backdrop-blur-sm">
                    <h1 className="text-3xl font-bold text-white mb-4">Admin Access</h1>
                    <p className="text-gray-400 mb-6">Connect your admin wallet to continue</p>
                    <WalletButton />
                </div>
            </div>
        );
    }

    if (!isAdmin) {
        return (
            <div className="min-h-screen bg-gradient-to-br from-gray-900 via-purple-900 to-black flex items-center justify-center">
                <div className="text-center p-8 bg-red-900/30 rounded-2xl border border-red-500/30 backdrop-blur-sm">
                    <h1 className="text-3xl font-bold text-red-400 mb-4">⛔ Access Denied</h1>
                    <p className="text-gray-400 mb-2">This wallet is not authorized for admin access.</p>
                    <p className="text-gray-500 text-sm font-mono">{publicKey?.toBase58()}</p>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gradient-to-br from-gray-900 via-purple-900 to-black">
            {/* Admin Navigation */}
            <nav className="bg-gray-800/50 border-b border-purple-500/30 backdrop-blur-sm sticky top-0 z-50">
                <div className="max-w-7xl mx-auto px-4 py-4 flex items-center justify-between">
                    <div className="flex items-center gap-4">
                        <h1 className="text-xl font-bold text-white">🔐 GRIT Admin</h1>
                        <span className="text-green-400 text-sm px-2 py-1 bg-green-900/30 rounded-full">
                            Admin Mode
                        </span>
                    </div>
                    <div className="flex items-center gap-4">
                        <Link
                            href="/"
                            className="text-gray-400 hover:text-white transition-colors"
                        >
                            ← Back to Dashboard
                        </Link>
                        <WalletButton />
                    </div>
                </div>
            </nav>

            {/* Admin Content */}
            <main className="max-w-7xl mx-auto px-4 py-8">
                {children}
            </main>
        </div>
    );
}
