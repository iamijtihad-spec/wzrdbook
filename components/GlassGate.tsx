"use client";

import { Lock } from "lucide-react";
import { useWallet } from "@solana/wallet-adapter-react";
import Link from "next/link";

export default function GlassGate({ children }: { children: React.ReactNode }) {
    const { connected } = useWallet();

    if (connected) return <>{children}</>;

    return (
        <div className="relative">
            <div className="filter blur-md pointer-events-none select-none opacity-50">
                {children}
            </div>
            <div className="absolute inset-0 flex flex-col items-center justify-center p-8 text-center bg-black/50 z-50">
                <Lock className="w-16 h-16 text-yellow-500 mb-6 animate-pulse" />
                <h2 className="text-3xl font-black text-white mb-4 uppercase italic">Restricted Access</h2>
                <p className="text-gray-300 mb-8 max-w-md">
                    This area is reserved for authenticated operatives.
                    <br />
                    Connect your neural interface (Wallet) to proceed.
                </p>
                {/* Relying on global wallet button or adding one here if needed */}
                <div className="text-yellow-500 font-bold animate-bounce">
                    ↓ Connect Wallet in Header ↓
                </div>
            </div>
        </div>
    );
}
