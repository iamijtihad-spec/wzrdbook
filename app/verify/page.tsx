"use client";

import Navigation from "@/components/Navigation";
import DiscordVerification from "@/components/DiscordVerification";
import { Suspense, useState, useEffect } from "react";
import { useWallet } from "@solana/wallet-adapter-react";
import WalletButton from "@/components/WalletButton";

function VerifyContent() {
    const { connected } = useWallet();
    const [mounted, setMounted] = useState(false);

    useEffect(() => {
        setMounted(true);
    }, []);

    if (!mounted) return <div className="pt-32 text-center">Loading...</div>;

    return (
        <div className="w-full">
            {connected ? (
                <DiscordVerification />
            ) : (
                <div className="text-center py-8">
                    <div className="w-16 h-16 bg-white/5 rounded-full flex items-center justify-center mx-auto mb-6 border border-white/10">
                        <span className="text-2xl">🔌</span>
                    </div>
                    <h2 className="text-xl font-bold text-white mb-2">Wallet Connection Required</h2>
                    <p className="text-gray-500 mb-8 text-sm">Please connect your Solana wallet to proceed with identity verification.</p>
                    <div className="flex justify-center scale-110">
                        <WalletButton />
                    </div>
                </div>
            )}
        </div>
    );
}

export default function VerifyPage() {
    return (
        <div className="min-h-screen bg-black text-white selection:bg-blue-500/30">
            <Navigation />

            <main className="max-w-4xl mx-auto px-4 pt-32 pb-20">
                {/* Hero / Header */}
                <div className="text-center mb-16 relative">
                    <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[300px] h-[300px] bg-blue-600/20 blur-[100px] rounded-full -z-10 pointer-events-none" />

                    <h1 className="text-5xl md:text-7xl font-black text-white mb-4 uppercase tracking-tighter">
                        Identity <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-indigo-500">Link</span>
                    </h1>
                    <p className="text-gray-400 text-lg max-w-xl mx-auto">
                        Connect your Discord identity to your Sovereign wallet. Verify your assets to unlock role-based access in the community.
                    </p>
                </div>

                {/* Content Wrapper */}
                <div className="glass-panel p-1 rounded-3xl border border-white/5 bg-black/40 max-w-2xl mx-auto overflow-hidden">
                    <div className="bg-black/50 p-8 md:p-12 rounded-[22px]">
                        <Suspense fallback={
                            <div className="flex flex-col items-center justify-center py-12">
                                <div className="w-8 h-8 rounded-full border-2 border-blue-500 border-t-transparent animate-spin mb-4" />
                                <span className="text-blue-500 font-mono text-sm uppercase tracking-widest">Initializing Protocol...</span>
                            </div>
                        }>
                            <VerifyContent />
                        </Suspense>
                    </div>
                </div>
            </main>
        </div>
    );
}
