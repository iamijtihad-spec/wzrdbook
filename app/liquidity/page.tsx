"use client";

import { useWallet } from "@solana/wallet-adapter-react";
import { useEffect, useState } from "react";
import Navigation from "@/components/Navigation";
import WalletButton from "@/components/WalletButton";

export default function LiquidityPage() {
    const { connected } = useWallet();
    const [stats, setStats] = useState({
        usdValue: 0,
        targetValue: 15000,
        gritPriceUsd: 0,
    });
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetchStats();
        const interval = setInterval(fetchStats, 10000); // Poll every 10s
        return () => clearInterval(interval);
    }, []);

    const fetchStats = async () => {
        try {
            const res = await fetch("/api/liquidity/stats");
            const data = await res.json();
            setStats(data);
            setLoading(false);
        } catch (e) {
            console.error("Failed to fetch stats", e);
            setLoading(false);
        }
    };

    const progress = Math.min((stats.usdValue / stats.targetValue) * 100, 100);

    return (
        <div className="min-h-screen pb-32">
            <Navigation />

            <main className="max-w-7xl mx-auto px-4 py-12 mt-24">
                {/* Header */}
                <div className="text-center mb-16 relative">
                    <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[300px] bg-teal-500/10 blur-[120px] rounded-full -z-10 pointer-events-none" />

                    <h1 className="text-6xl md:text-8xl font-black text-transparent bg-clip-text bg-gradient-to-r from-teal-400 to-blue-500 mb-6 tracking-tight text-glow-teal">
                        Liquidity <span className="text-white">Pool</span>
                    </h1>
                    <p className="text-xl md:text-2xl text-gray-300 max-w-3xl mx-auto leading-relaxed font-light">
                        Help stabilize the ecosystem. Add liquidity to the <span className="text-white font-bold">GRIT/SOL</span> pool on Raydium.
                    </p>
                </div>

                {/* Progress Section */}
                <div className="max-w-4xl mx-auto mb-16 animate-slide-up">
                    <div className="glass-panel rounded-3xl p-8 bg-black/40 border-teal-500/20 relative overflow-hidden group">

                        <div className="flex justify-between items-end mb-6 relative z-10">
                            <div>
                                <p className="text-teal-400 text-xs font-bold tracking-[0.2em] uppercase mb-2">Total Value Locked</p>
                                <div className="text-6xl font-black text-white tracking-tighter">
                                    ${stats.usdValue.toLocaleString()}
                                </div>
                            </div>
                            <div className="text-right">
                                <p className="text-gray-500 text-xs font-bold uppercase mb-2">Target Goal</p>
                                <div className="text-2xl font-bold text-gray-400 font-mono">
                                    / ${stats.targetValue.toLocaleString()}
                                </div>
                            </div>
                        </div>

                        {/* Progress Bar */}
                        <div className="h-8 bg-gray-900/50 rounded-full overflow-hidden border border-white/5 relative shadow-inner">
                            <div
                                className="h-full bg-gradient-to-r from-teal-600 via-blue-500 to-purple-500 transition-all duration-1000 ease-out relative"
                                style={{ width: `${progress}%` }}
                            >
                                <div className="absolute inset-0 bg-white/20 animate-[pulse_3s_infinite]" />
                                <div className="absolute right-0 top-0 bottom-0 w-1 bg-white/50 blur-[2px]" />
                            </div>
                        </div>

                        <div className="mt-4 flex justify-between text-xs text-gray-400 font-mono">
                            <span>0%</span>
                            <span className="text-teal-400 font-bold">{progress.toFixed(1)}% FUNDED</span>
                            <span>100%</span>
                        </div>
                    </div>
                </div>

                {/* Info Grid */}
                <div className="grid md:grid-cols-2 gap-8 max-w-4xl mx-auto mb-16">
                    <div className="glass-panel p-8 rounded-2xl bg-black/20 hover:bg-black/40 transition-colors border-white/5">
                        <h3 className="text-2xl font-bold text-white mb-6">🛡️ Benefits of LP</h3>
                        <ul className="space-y-4 text-gray-300">
                            <li className="flex gap-4 items-start">
                                <div className="w-6 h-6 rounded-full bg-teal-500/20 flex items-center justify-center text-teal-400 text-sm flex-shrink-0 mt-0.5">✓</div>
                                <span>Earn trading fees from every transaction directly on Raydium.</span>
                            </li>
                            <li className="flex gap-4 items-start">
                                <div className="w-6 h-6 rounded-full bg-teal-500/20 flex items-center justify-center text-teal-400 text-sm flex-shrink-0 mt-0.5">✓</div>
                                <span>Support price stability and reduce slippage for everyone.</span>
                            </li>
                            <li className="flex gap-4 items-start">
                                <div className="w-6 h-6 rounded-full bg-teal-500/20 flex items-center justify-center text-teal-400 text-sm flex-shrink-0 mt-0.5">✓</div>
                                <span>Strengthen the project foundation for future growth.</span>
                            </li>
                        </ul>
                    </div>

                    <div className="glass-panel p-8 rounded-2xl bg-gradient-to-br from-teal-900/10 to-blue-900/10 border-teal-500/30 flex flex-col items-center justify-center text-center relative overflow-hidden">
                        <div className="absolute inset-0 bg-teal-500/5 blur-xl pointer-events-none" />

                        <div className="relative z-10 w-full">
                            <h3 className="text-2xl font-bold text-white mb-3">Add Liquidity</h3>
                            <p className="text-gray-400 mb-8 text-sm max-w-xs mx-auto">
                                Deposit SOL & GRIT into the Raydium pool. You retain 100% custody of your LP tokens.
                            </p>

                            {connected ? (
                                <a
                                    href="https://raydium.io/liquidity/add/"
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="w-full py-4 bg-teal-500 hover:bg-teal-400 text-black font-black text-lg rounded-xl shadow-[0_0_20px_rgba(45,212,191,0.3)] transition-all hover:scale-[1.02] flex items-center justify-center gap-2"
                                >
                                    <span>💧</span> Go to Raydium
                                </a>
                            ) : (
                                <div className="bg-black/40 p-4 rounded-xl border border-white/10 w-full">
                                    <p className="text-sm text-gray-400 mb-3">Connect wallet to proceed</p>
                                    <div className="flex justify-center">
                                        <WalletButton />
                                    </div>
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            </main>
        </div>
    );
}
