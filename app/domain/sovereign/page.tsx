"use client";

import { Suspense, useEffect } from "react";
import { motion } from "framer-motion";
import { useRouter, useSearchParams } from "next/navigation";
import { useGritState } from "@/components/GritStateProvider";
import Navigation from "@/components/Navigation";
import MusicTrackRow from "@/components/MusicTrackRow";
import WalletButton from "@/components/WalletButton";
import Link from "next/link";
import Image from "next/image";
import artistConfig from "@/config/artist.json";
import { Coins, Layers, Crown, Zap, Shield, Star, Users, ArrowRight, Music } from "lucide-react";
import StatCard from "@/components/dashboard/StatCard";
import { FluidAudioPlayer } from "@/components/domain/sovereign/FluidAudioPlayer";
export default function SovereignPage() {
    return (
        <Suspense fallback={<div className="min-h-screen bg-black flex items-center justify-center text-orange-500">Loading Command Center...</div>}>
            <SovereignContent />
        </Suspense>
    );
}

function SovereignContent() {
    const { tracks, currentTrack, isPlaying, playTrack, hasAccess, isConnected, gritBalance, ownedMints, stakedAmount, stakingTier, refreshBalances, discordUser, epochData, resonance } = useGritState();
    const searchParams = useSearchParams();

    useEffect(() => {
        if (searchParams?.get("discord_linked") === "true") {
            refreshBalances();
            window.history.replaceState(null, "", "/domain/sovereign");
        }
    }, [searchParams, refreshBalances]);

    return (
        <div className="min-h-screen pb-32 bg-black text-white selection:bg-orange-500/30 font-sans">
            <Navigation />

            <main className="max-w-[1600px] mx-auto px-4 md:px-8 py-8 mt-24">

                {/* HEADER */}
                <header className="flex flex-col md:flex-row justify-between items-end mb-12 relative z-10">
                    <div>
                        <div className="flex items-center gap-2 mb-2">
                            <span className="w-2 h-2 rounded-full bg-orange-500 animate-pulse shadow-[0_0_10px_orange]" />
                            <span className="text-orange-500 font-bold uppercase tracking-widest text-xs">Sovereign Domain</span>
                        </div>
                        <h1 className="text-5xl md:text-7xl font-black text-white tracking-tighter uppercase leading-none">
                            Command <span className="text-transparent bg-clip-text bg-gradient-to-r from-orange-500 to-red-500">Center</span>
                        </h1>
                    </div>
                    {!isConnected && (
                        <div className="mt-6 md:mt-0">
                            <WalletButton />
                        </div>
                    )}
                </header>
                {/* RESONANCE PROGRESS */}
                <div className="mb-12 glass-panel p-6 rounded-3xl border border-white/5 bg-gradient-to-r from-orange-500/10 to-transparent relative overflow-hidden">
                    <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 relative z-10">
                        <div className="flex items-center gap-4">
                            <div className="w-12 h-12 rounded-full border border-orange-500/30 flex items-center justify-center bg-black shadow-[0_0_20px_rgba(255,165,0,0.1)]">
                                <Music className="w-6 h-6 text-orange-500" />
                            </div>
                            <div>
                                <h3 className="font-serif font-bold text-xl text-white">Resonance Signal</h3>
                                <p className="text-[10px] text-orange-500 font-mono uppercase tracking-[0.2em]">{resonance >= 100 ? "Ascesis Imminent" : "Building Frequency"}</p>
                            </div>
                        </div>

                        <div className="flex-grow max-w-2xl px-4">
                            <div className="flex justify-between text-[10px] font-mono mb-2 uppercase tracking-widest text-[#666]">
                                <span>Signal Strength</span>
                                <span className="text-orange-500">{Math.floor((resonance / 144) * 100)}%</span>
                            </div>
                            <div className="h-2 w-full bg-white/5 rounded-full overflow-hidden border border-white/5">
                                <motion.div
                                    className="h-full bg-gradient-to-r from-orange-600 to-orange-400 shadow-[0_0_15px_#ff8c00]"
                                    initial={{ width: 0 }}
                                    animate={{ width: `${Math.min((resonance / 144) * 100, 100)}%` }}
                                    transition={{ duration: 1 }}
                                />
                            </div>
                        </div>

                        <div className="hidden md:block text-right">
                            <p className="text-[10px] text-[#444] font-mono uppercase mb-1">Threshold</p>
                            <p className="font-serif text-white italic">144 Resonance</p>
                        </div>
                    </div>

                    {/* Animated Grain/Texture */}
                    <div className="absolute inset-0 opacity-10 pointer-events-none" style={{ backgroundImage: 'url("https://grainy-gradients.vercel.app/noise.svg")' }} />
                </div>

                {/* STATS (Gated) */}
                {isConnected && (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-12">
                        <StatCard title="GRIT Balance" value={gritBalance.toLocaleString()} subValue="Native Currency" icon={Coins} color="text-orange-400" />
                        <StatCard title="Artifacts" value={ownedMints.size} subValue="NFTs Held" icon={Layers} color="text-purple-400" />
                        <StatCard title="Staking Power" value={stakingTier} subValue={`${stakedAmount.toFixed(0)} MOXY Locked`} icon={Crown} color="text-amber-400" />
                        <Link href="/verify" className="block transition-transform hover:scale-[1.02] active:scale-95">
                            <StatCard
                                title="Identity"
                                value={discordUser ? discordUser.username : "Anonymous"}
                                subValue={discordUser ? "Verified" : "Link Discord"}
                                icon={Shield}
                                color={discordUser ? "text-green-400" : "text-gray-400"}
                            />
                        </Link>
                    </div>
                )}

                <div className="grid lg:grid-cols-12 gap-8">

                    {/* LEFT COLUMN: AUDIO PLAYER (7 cols) */}
                    <div className="lg:col-span-8 flex flex-col gap-6">
                        {/* FLUID AUDIO CORE */}
                        <div className="glass-panel rounded-[2rem] border border-white/5 relative overflow-hidden group">
                            {/* Fluid Visualizer Background */}
                            <FluidAudioPlayer className="h-[500px] w-full" />

                            <div className="absolute inset-0 bg-gradient-to-t from-black via-black/20 to-transparent pointer-events-none" />

                            {/* Player Controls Overlay */}
                            <div className="absolute bottom-0 left-0 right-0 p-8 md:p-12 z-10">
                                <div className="flex flex-col md:flex-row gap-8 md:items-end justify-between">
                                    <div>
                                        <div className="inline-block px-3 py-1 rounded-full bg-white/10 backdrop-blur-md border border-white/10 mb-4">
                                            <span className="text-[10px] font-bold uppercase tracking-widest text-white/80">
                                                {hasAccess ? "Authenticated Session" : "Restricted Access"}
                                            </span>
                                        </div>
                                        <h2 className="text-4xl md:text-5xl font-black text-white leading-none mb-2 drop-shadow-lg">
                                            {currentTrack ? currentTrack.title : `${artistConfig.tokenName} Mixtape`}
                                        </h2>
                                        <p className="text-gray-300 max-w-md text-lg leading-relaxed drop-shadow-md">
                                            {currentTrack ? currentTrack.artist : "Experience the sonic archives."}
                                        </p>
                                    </div>

                                    <button
                                        disabled={!hasAccess}
                                        onClick={() => tracks[0] && playTrack(tracks[0])}
                                        className="px-8 py-4 bg-white text-black text-sm font-bold uppercase tracking-widest rounded-full hover:bg-orange-500 hover:text-white transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-3 shadow-xl"
                                    >
                                        <Zap size={18} fill="currentColor" />
                                        {isPlaying ? "Streaming..." : "Initialize"}
                                    </button>
                                </div>
                            </div>
                        </div>

                        {/* TRACK LIST (Replaced with MusicTrackRow) */}
                        <div className="glass-panel p-6 rounded-xl border border-white/5">
                            <div className="flex items-center gap-2 mb-6">
                                <div className="w-2 h-2 rounded-full bg-orange-500 animate-pulse" />
                                <h3 className="text-sm font-bold uppercase tracking-widest text-gray-400">Available Artifacts ({tracks.length})</h3>
                            </div>

                            <div className="space-y-2">
                                {Array.from(new Set(tracks.map(t => t.title))).map((title) => {
                                    const track = tracks.find(t => t.title === title && t.rarity === 'Common') || tracks.find(t => t.title === title);
                                    if (!track) return null;

                                    // Determine if playable/owned
                                    const isOwned = hasAccess || !!track.isLocal;

                                    return (
                                        <MusicTrackRow
                                            key={track.title}
                                            title={track.title}
                                            imageFile={track.imageFile || "wzrd_cd.png"}
                                            artist={track.artist}
                                            isOwned={isOwned}
                                            isPlaying={currentTrack?.title === track.title && isPlaying}
                                            onPlay={() => playTrack(track)}
                                        />
                                    );
                                })}
                            </div>
                        </div>
                    </div>

                    {/* RIGHT COLUMN: DOMAIN GRID (5 cols) */}
                    <div className="lg:col-span-4 flex flex-col gap-4">

                        {/* GOVERNANCE */}
                        <Link href="/vote" className="group glass-panel p-6 rounded-3xl border border-white/5 bg-gradient-to-br from-indigo-900/20 to-black hover:border-indigo-500/50 transition-all relative overflow-hidden">
                            <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:opacity-20 transition-opacity">
                                <Users size={64} />
                            </div>
                            <div className="relative z-10">
                                <div className="w-10 h-10 rounded-full bg-indigo-500/20 flex items-center justify-center text-indigo-400 mb-4 group-hover:scale-110 transition-transform">
                                    <Users size={20} />
                                </div>
                                <h3 className="text-2xl font-bold text-white mb-1">Governance</h3>
                                <p className="text-sm text-indigo-200/60 mb-4">Consensus & Proposals</p>
                                <div className="flex items-center gap-2 text-xs font-bold text-indigo-400 uppercase tracking-widest">
                                    <span>Access Terminal</span>
                                    <ArrowRight size={14} className="group-hover:translate-x-1 transition-transform" />
                                </div>
                            </div>
                        </Link>

                        <div className="grid grid-cols-2 gap-4">
                            {/* MUSEUM */}
                            <Link href="/museum" className="group glass-panel p-5 rounded-3xl border border-white/5 bg-gradient-to-br from-purple-900/20 to-black hover:border-purple-500/50 transition-all">
                                <div className="w-8 h-8 rounded-lg bg-purple-500/20 flex items-center justify-center text-purple-400 mb-3">
                                    <Layers size={16} />
                                </div>
                                <h4 className="font-bold text-white">Museum</h4>
                                <p className="text-xs text-purple-200/50">NFT Gallery</p>
                            </Link>

                            {/* GUIDE */}
                            <Link href="/guide" className="group glass-panel p-5 rounded-3xl border border-white/5 bg-gradient-to-br from-amber-900/20 to-black hover:border-amber-500/50 transition-all">
                                <div className="w-8 h-8 rounded-lg bg-amber-500/20 flex items-center justify-center text-amber-400 mb-3">
                                    <Star size={16} />
                                </div>
                                <h4 className="font-bold text-white">Guide</h4>
                                <p className="text-xs text-amber-200/50">The Lore</p>
                            </Link>
                        </div>

                        {/* LIVE FEED */}
                        <Link href="/live" className="group glass-panel p-6 rounded-3xl border border-white/5 bg-gradient-to-br from-red-900/20 to-black hover:border-red-500/50 transition-all relative">
                            <div className="flex justify-between items-start">
                                <div>
                                    <div className="w-10 h-10 rounded-full bg-red-500/20 flex items-center justify-center text-red-400 mb-4">
                                        <Zap size={20} />
                                    </div>
                                    <h3 className="text-2xl font-bold text-white mb-1">Live Feed</h3>
                                    <p className="text-sm text-red-200/60">System Events & Chat</p>
                                </div>
                                <div className="flex flex-col items-end">
                                    <span className="flex h-3 w-3 relative">
                                        <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-500 opacity-75"></span>
                                        <span className="relative inline-flex rounded-full h-3 w-3 bg-red-500"></span>
                                    </span>
                                </div>
                            </div>
                        </Link>

                        {/* REMOVED REDUNDANT VERIFY LINK */}

                    </div>
                </div>
            </main>
        </div>
    );
}

// End of SovereignPage
