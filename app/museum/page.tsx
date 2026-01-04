"use client";

import { useGritState } from "@/components/GritStateProvider";
import Navigation from "@/components/Navigation";
import WalletButton from "@/components/WalletButton";
import Image from "next/image";
import { useState } from "react";
import ClaimNFT from "@/components/ClaimNFT";
import { motion, AnimatePresence } from "framer-motion";
import { Lock, Unlock, Trophy } from "lucide-react";

export default function MuseumPage() {
    const { tracks, gritBalance, isConnected, ownedMints, refreshBalances } = useGritState();
    const [selectedTrack, setSelectedTrack] = useState<any>(null);

    // Price determination based on artifact rarity
    const getPrice = (rarity: string = 'Common') => {
        switch (rarity) {
            case 'Legendary': return 10000;
            case 'Epic': return 5000;
            case 'Rare': return 1000;
            default: return 100;
        }
    };

    // Calculate progression
    const sortedTracks = [...tracks].sort((a, b) => getPrice(a.rarity) - getPrice(b.rarity));

    // Empty State
    if (tracks.length === 0) {
        return (
            <div className="min-h-screen pb-32 bg-black selection:bg-purple-500/30">
                <Navigation />
                <main className="max-w-7xl mx-auto px-4 py-8 mt-32 text-center">
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="max-w-md mx-auto p-12 glass-panel rounded-3xl border border-white/5"
                    >
                        <div className="w-16 h-16 bg-white/5 rounded-full flex items-center justify-center mx-auto mb-6">
                            <Lock className="w-6 h-6 text-gray-500" />
                        </div>
                        <h1 className="text-3xl font-bold text-white mb-2 font-serif">Archives Sealed</h1>
                        <p className="text-gray-400">The curators are arranging the artifacts. Please return shortly.</p>
                    </motion.div>
                </main>
            </div>
        );
    }

    const nextMilestone = tracks
        .map(t => t.price)
        .sort((a, b) => a - b)
        .find(p => p > gritBalance) || tracks[tracks.length - 1].price;

    const progressPercent = Math.min((gritBalance / nextMilestone) * 100, 100);

    return (
        <div className="min-h-screen pb-32 bg-black selection:bg-purple-500/30">
            <Navigation />

            <main className="max-w-7xl mx-auto px-4 py-8 mt-24">
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.8 }}
                    className="text-center mb-16 relative"
                >
                    <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[300px] bg-purple-600/20 blur-[120px] rounded-full -z-10 pointer-events-none" />

                    <h1 className="text-6xl md:text-8xl font-black text-white mb-6 text-glow tracking-tighter">
                        THE <span className="text-transparent bg-clip-text bg-gradient-to-r from-purple-400 to-pink-500">MUSEUM</span>
                    </h1>
                    <p className="text-gray-300 text-lg md:text-xl mb-10 max-w-2xl mx-auto font-light leading-relaxed">
                        A curated archive of sonic artifacts. Hold <span className="text-white font-bold">GRIT</span> to unlock exclusivity.
                    </p>

                    {!isConnected ? (
                        <motion.div
                            whileHover={{ scale: 1.05 }}
                            whileTap={{ scale: 0.95 }}
                            className="inline-block"
                        >
                            <WalletButton />
                        </motion.div>
                    ) : (
                        <motion.div
                            initial={{ scale: 0.9, opacity: 0 }}
                            animate={{ scale: 1, opacity: 1 }}
                            transition={{ delay: 0.2 }}
                            className="max-w-2xl mx-auto glass-panel rounded-2xl p-6 bg-black/40 border-white/10 relative overflow-hidden backdrop-blur-xl"
                        >
                            <div className="flex justify-between items-end text-white mb-4 font-mono">
                                <div className="flex flex-col items-start">
                                    <span className="text-[10px] text-gray-500 font-bold uppercase tracking-widest mb-1">Access Level</span>
                                    <span className="text-2xl font-bold text-white shadow-purple-500/20 drop-shadow-lg">{gritBalance.toLocaleString()} <span className="text-sm text-gray-500">GRIT</span></span>
                                </div>
                                <div className="flex flex-col items-end">
                                    <span className="text-[10px] text-gray-500 font-bold uppercase tracking-widest mb-1">Next Unlock</span>
                                    <span className="text-xl font-bold text-gray-400">{nextMilestone.toLocaleString()} <span className="text-sm text-gray-600">GRIT</span></span>
                                </div>
                            </div>

                            {/* Progress Bar Container */}
                            <div className="w-full h-1.5 bg-gray-900 rounded-full overflow-hidden relative">
                                <motion.div
                                    initial={{ width: 0 }}
                                    animate={{ width: `${progressPercent}%` }}
                                    transition={{ duration: 1.5, ease: "easeOut" }}
                                    className="h-full bg-gradient-to-r from-purple-600 via-pink-500 to-orange-500 relative"
                                >
                                    <div className="absolute inset-0 bg-white/20 animate-pulse" />
                                    <div className="absolute right-0 top-0 bottom-0 w-2 bg-white/50 blur-[2px]" />
                                </motion.div>
                            </div>
                        </motion.div>
                    )}
                </motion.div>

                <div className="space-y-24">
                    {/* Group by Track Title */}
                    {Array.from(new Set(sortedTracks.map(t => t.title))).map((title, sectionIndex) => {
                        const trackNFTs = sortedTracks.filter(t => t.title === title)
                            .sort((a, b) => a.price - b.price); // Order: Common -> Legendary

                        if (trackNFTs.length === 0) return null;

                        return (
                            <motion.div
                                key={title}
                                initial={{ opacity: 0, y: 50 }}
                                whileInView={{ opacity: 1, y: 0 }}
                                viewport={{ once: true }}
                                transition={{ delay: sectionIndex * 0.1 }}
                                className="relative"
                            >
                                {/* Track Header */}
                                <div className="mb-8 flex items-baseline justify-between border-b border-white/5 pb-4">
                                    <h2 className="text-4xl md:text-5xl font-black text-white uppercase tracking-tighter">
                                        {title}
                                    </h2>
                                    <span className="text-gray-600 font-mono text-xs uppercase tracking-widest">{trackNFTs.length} VARIANTS</span>
                                </div>

                                {/* Tiers Grid */}
                                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                                    {trackNFTs.map((track, i) => {
                                        const isUnlocked = isConnected && gritBalance >= track.price;
                                        const isOwned = ownedMints.has(track.mint);

                                        return (
                                            <motion.div
                                                key={track.mint}
                                                whileHover={isUnlocked ? { y: -10, boxShadow: "0 20px 40px -10px rgba(168,85,247,0.3)" } : {}}
                                                className={`relative group rounded-2xl overflow-hidden transition-all duration-300 border ${isUnlocked
                                                    ? "bg-gradient-to-b from-white/10 to-black/40 border-white/10"
                                                    : "bg-black/40 border-white/5 grayscale opacity-50"
                                                    }`}
                                            >
                                                {/* Image */}
                                                <div className="aspect-square relative overflow-hidden">
                                                    <Image
                                                        src={`/images/${track.imageFile}`}
                                                        alt={`${track.title} - ${track.rarity}`}
                                                        fill
                                                        className={`object-cover transition-transform duration-700 ${isUnlocked ? 'group-hover:scale-110' : ''}`}
                                                    />

                                                    {/* Lock Overlay */}
                                                    {!isUnlocked && (
                                                        <div className="absolute inset-0 bg-black/80 backdrop-blur-sm flex flex-col items-center justify-center p-4">
                                                            <Lock className="w-8 h-8 text-gray-500 mb-2" />
                                                            <span className="text-sm text-gray-400 font-mono font-bold">{track.price.toLocaleString()} GRIT</span>
                                                        </div>
                                                    )}

                                                    {/* Rarity Tag */}
                                                    <div className="absolute top-3 right-3 z-10">
                                                        <span className={`px-3 py-1 rounded text-[10px] font-bold uppercase tracking-widest backdrop-blur-md shadow-lg border ${track.rarity === 'Legendary' ? 'bg-black/50 text-yellow-400 border-yellow-500/50' :
                                                            track.rarity === 'Epic' ? 'bg-black/50 text-purple-400 border-purple-500/50' :
                                                                track.rarity === 'Rare' ? 'bg-black/50 text-blue-400 border-blue-500/50' :
                                                                    'bg-black/50 text-gray-300 border-gray-500/50'
                                                            }`}>
                                                            {track.rarity}
                                                        </span>
                                                    </div>

                                                    {/* Owned Badge */}
                                                    {isOwned && (
                                                        <div className="absolute top-3 left-3 z-10">
                                                            <span className="w-6 h-6 rounded-full bg-green-500 text-black flex items-center justify-center shadow-[0_0_10px_rgba(34,197,94,0.5)]">
                                                                <Trophy size={12} fill="currentColor" />
                                                            </span>
                                                        </div>
                                                    )}
                                                </div>

                                                {/* Action Panel */}
                                                <div className="p-5">
                                                    <div className="flex justify-between items-center mb-4">
                                                        <span className="text-[10px] font-bold text-gray-500 uppercase tracking-widest">Requirement</span>
                                                        <span className={`text-xs font-mono font-bold ${isUnlocked ? "text-white" : "text-gray-600"}`}>
                                                            {track.price.toLocaleString()} GRIT
                                                        </span>
                                                    </div>

                                                    {isUnlocked ? (
                                                        !isOwned ? (
                                                            <button
                                                                onClick={() => setSelectedTrack(track)}
                                                                className="w-full py-3 bg-white text-black rounded-xl text-xs font-bold uppercase tracking-wider hover:bg-gray-200 transition-colors shadow-lg shadow-white/10"
                                                            >
                                                                Claim Artifact
                                                            </button>
                                                        ) : (
                                                            <button disabled className="w-full py-3 bg-green-500/20 text-green-400 border border-green-500/20 rounded-xl text-xs font-bold uppercase tracking-wider cursor-default flex items-center justify-center gap-2">
                                                                Artifact Secured
                                                            </button>
                                                        )
                                                    ) : (
                                                        <button disabled className="w-full py-3 bg-white/5 text-gray-500 border border-white/5 rounded-xl text-xs font-bold uppercase tracking-wider cursor-not-allowed">
                                                            Locked
                                                        </button>
                                                    )}
                                                </div>
                                            </motion.div>
                                        );
                                    })}
                                </div>
                            </motion.div>
                        );
                    })}
                </div>

                {/* Claim Modal Animation Wrapper */}
                <AnimatePresence>
                    {selectedTrack && (
                        <ClaimNFT
                            nftMint={selectedTrack.mint}
                            nftName={selectedTrack.title}
                            price={selectedTrack.price}
                            tier={selectedTrack.rarity}
                            onClose={() => setSelectedTrack(null)}
                            onSuccess={() => {
                                setSelectedTrack(null);
                                refreshBalances();
                            }}
                        />
                    )}
                </AnimatePresence>
            </main>
        </div>
    );
}
