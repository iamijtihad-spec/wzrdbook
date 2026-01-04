"use client";

import { useWallet } from "@solana/wallet-adapter-react";
import { useState } from "react";
import Navigation from "@/components/Navigation";
import WalletButton from "@/components/WalletButton";
import { useGritState } from "@/components/GritStateProvider";
import ClaimNFT from "@/components/ClaimNFT";
import Image from "next/image";
import Link from "next/link";

export default function ClaimPage() {
    const { publicKey, connected } = useWallet();
    const { tracks, gritBalance, ownedMints, refreshBalances } = useGritState();
    const [selectedClaim, setSelectedClaim] = useState<any>(null);

    // Identify claimable items: Unlocked by balance but NOT owned
    const claimableTracks = tracks.filter(t =>
        gritBalance >= t.price && !ownedMints.has(t.mint)
    );

    // Also show locked items as "Up Next"
    const nextRewards = tracks.filter(t =>
        gritBalance < t.price
    ).sort((a, b) => a.price - b.price);

    if (!connected) {
        return (
            <div className="min-h-screen pb-32">
                <Navigation />
                <div className="flex items-center justify-center min-h-[80vh]">
                    <div className="text-center p-12 glass-panel rounded-3xl bg-black/40 border-purple-500/20 max-w-lg mx-4">
                        <div className="text-5xl mb-6">🎁</div>
                        <h1 className="text-4xl font-bold text-white mb-4">Rewards Center</h1>
                        <p className="text-gray-400 mb-8 text-lg">
                            Connect your wallet to check for available artifacts and exclusive airdrops.
                        </p>
                        <div className="flex justify-center scale-110">
                            <WalletButton />
                        </div>
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen pb-32">
            <Navigation />

            <main className="max-w-4xl mx-auto px-4 py-8 mt-24">
                <header className="mb-12 text-center md:text-left relative">
                    <div className="absolute top-0 right-0 w-64 h-64 bg-green-500/10 blur-[100px] rounded-full -z-10 pointer-events-none" />

                    <h1 className="text-5xl md:text-7xl font-black text-white mb-4 tracking-tight">
                        Rewards <span className="text-transparent bg-clip-text bg-gradient-to-r from-green-400 to-teal-500">Center</span>
                    </h1>
                    <p className="text-gray-400 text-xl max-w-2xl">
                        Claim your unlocked artifacts. These rewards are verified on-chain based on your current GRIT holdings.
                    </p>
                </header>

                <div className="space-y-12 animate-slide-up">
                    {/* Available Claims Section */}
                    <section>
                        <div className="flex items-center gap-4 mb-6">
                            <h2 className="text-2xl font-bold text-white flex items-center gap-3">
                                <span className="relative flex h-3 w-3">
                                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75"></span>
                                    <span className="relative inline-flex rounded-full h-3 w-3 bg-green-500"></span>
                                </span>
                                Available to Claim
                            </h2>
                            <span className="px-3 py-1 rounded-full bg-white/5 border border-white/10 text-gray-400 text-xs font-bold uppercase tracking-wider">
                                {claimableTracks.length} Items
                            </span>
                        </div>

                        {claimableTracks.length === 0 ? (
                            <div className="glass-panel rounded-2xl p-12 text-center bg-black/20 border-white/5 flex flex-col items-center">
                                <div className="w-20 h-20 rounded-full bg-white/5 flex items-center justify-center mb-6 text-4xl shadow-inner">
                                    ✨
                                </div>
                                <h3 className="text-2xl font-bold text-white mb-2">All Caught Up!</h3>
                                <p className="text-gray-400 mb-8 max-w-md mx-auto">
                                    You have claimed all rewards available for your current GRIT balance. Increase your holdings to unlock more.
                                </p>
                                <Link href="/museum" className="px-8 py-3 bg-white/5 hover:bg-white/10 border border-purple-500/30 text-purple-400 rounded-xl font-bold transition-all hover:scale-105 flex items-center gap-2">
                                    <span>🏛️</span> Visit Museum
                                </Link>
                            </div>
                        ) : (
                            <div className="grid gap-4">
                                {claimableTracks.map((track) => (
                                    <div
                                        key={track.mint}
                                        className="glass-panel rounded-2xl p-4 flex items-center gap-6 transition-all hover:bg-white/5 group border-green-500/20 hover:border-green-500/40 relative overflow-hidden"
                                    >
                                        <div className="absolute inset-x-0 bottom-0 h-1 bg-gradient-to-r from-transparent via-green-500/50 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />

                                        {/* Image */}
                                        <div className="w-24 h-24 rounded-xl overflow-hidden relative flex-shrink-0 shadow-lg group-hover:scale-105 transition-transform duration-500">
                                            <Image
                                                src={`/images/${track.imageFile}`}
                                                alt={track.title}
                                                fill
                                                className="object-cover"
                                            />
                                        </div>

                                        {/* Info */}
                                        <div className="flex-grow min-w-0 py-2">
                                            <div className="flex items-center gap-3 mb-2">
                                                <h3 className="font-bold text-white text-2xl truncate">{track.title}</h3>
                                                <span className={`px-2 py-0.5 rounded text-[10px] uppercase font-bold tracking-wider border ${track.rarity === 'Legendary' ? 'bg-yellow-500/10 text-yellow-500 border-yellow-500/20' :
                                                        track.rarity === 'Epic' ? 'bg-purple-500/10 text-purple-500 border-purple-500/20' :
                                                            track.rarity === 'Rare' ? 'bg-blue-500/10 text-blue-500 border-blue-500/20' :
                                                                'bg-gray-500/10 text-gray-400 border-gray-500/20'
                                                    }`}>
                                                    {track.rarity}
                                                </span>
                                            </div>
                                            <p className="text-green-400 text-sm font-bold flex items-center gap-2">
                                                <span>🔓 Unlocked</span>
                                                <span className="w-1 h-1 rounded-full bg-gray-600" />
                                                <span className="text-gray-400 font-normal">Requires {track.price} GRIT</span>
                                            </p>
                                        </div>

                                        {/* Action */}
                                        <button
                                            onClick={() => setSelectedClaim(track)}
                                            className="px-8 py-4 bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-500 hover:to-emerald-500 text-white rounded-xl font-bold shadow-lg shadow-green-900/20 whitespace-nowrap transition-all hover:scale-105 hover:shadow-green-500/20"
                                        >
                                            Claim Now
                                        </button>
                                    </div>
                                ))}
                            </div>
                        )}
                    </section>

                    {/* Up Next Section */}
                    {nextRewards.length > 0 && (
                        <section className="opacity-60 hover:opacity-100 transition-opacity duration-500">
                            <h2 className="text-2xl font-bold text-white mb-6 flex items-center gap-3">
                                <span>🔒</span> Locked Rewards
                            </h2>
                            <div className="grid gap-4">
                                {nextRewards.map((track) => (
                                    <div
                                        key={track.mint}
                                        className="bg-white/5 border border-white/5 rounded-2xl p-4 flex items-center gap-6 grayscale hover:grayscale-0 transition-all duration-500 hover:bg-white/10"
                                    >
                                        <div className="w-20 h-20 rounded-xl overflow-hidden relative flex-shrink-0 bg-black/50">
                                            <Image
                                                src={`/images/${track.imageFile}`}
                                                alt={track.title}
                                                fill
                                                className="object-cover opacity-60"
                                            />
                                        </div>
                                        <div>
                                            <h3 className="font-bold text-gray-300 text-lg mb-1">{track.title}</h3>
                                            <p className="text-gray-500 text-sm font-mono">
                                                Requires {track.price.toLocaleString()} GRIT
                                            </p>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </section>
                    )}
                </div>

                {/* Claim Modal */}
                {selectedClaim && (
                    <ClaimNFT
                        nftMint={selectedClaim.mint}
                        nftName={selectedClaim.title}
                        price={selectedClaim.price}
                        tier={selectedClaim.rarity}
                        onClose={() => setSelectedClaim(null)}
                        onSuccess={() => {
                            setSelectedClaim(null);
                            refreshBalances();
                        }}
                    />
                )}
            </main>
        </div>
    );
}
