"use client";

import { useState, useRef, useEffect } from "react";
import { useWallet } from "@solana/wallet-adapter-react";
import { useGritState } from "./GritStateProvider";

export default function FullMusicPlayer() {
    const { publicKey } = useWallet();
    const {
        currentTrack,
        isPlaying,
        stopTrack,
        playTrack,
        tracks,
        hasAccess,
        gritBalance,
        ownedMints,
        addResonance,
        proposals // Governance Data
    } = useGritState();

    // MASTER Audio (Single File)
    const audioRef = useRef<HTMLAudioElement>(null);
    // STEM Audios (5-Channel)
    const vox1Ref = useRef<HTMLAudioElement>(null);
    const inoutRef = useRef<HTMLAudioElement>(null);
    const adlibsRef = useRef<HTMLAudioElement>(null);
    const bgvoxRef = useRef<HTMLAudioElement>(null);
    const instRef = useRef<HTMLAudioElement>(null);

    const [currentTime, setCurrentTime] = useState(0);
    const [duration, setDuration] = useState(0);
    const [volume, setVolume] = useState(0.7);
    const [isExpanded, setIsExpanded] = useState(false);

    // Stem Gains (Calculated from Governance)
    const [gains, setGains] = useState({
        vox1: 1.0,
        inout: 1.0,
        adlibs: 1.0,
        bgvox: 1.0,
        inst: 1.0
    });

    // Detect Mode
    // (Removed old commented line)

    // GOVERNANCE MIXER LOGIC
    // The Community Mixes the Master.
    useEffect(() => {
        if (!proposals || proposals.length === 0) return;

        const newGains = { vox1: 1.0, inout: 1.0, adlibs: 1.0, bgvox: 1.0, inst: 1.0 };
        const STEM_KEYS = ['vox1', 'inout', 'adlibs', 'bgvox', 'inst'];

        STEM_KEYS.forEach(stemKey => {
            // Find all proposals targeting this stem
            const relevantProposals = proposals.filter(p =>
                p.title.toLowerCase().includes(`[${stemKey.toLowerCase()}]`) || // Strict Match [VOX1]
                p.title.toLowerCase().includes(stemKey.toLowerCase()) // Legacy/Loose Match
            );

            let netImpact = 0;

            relevantProposals.forEach(p => {
                const isAmplify = p.title.toUpperCase().includes("AMPLIFY");
                const isDampen = p.title.toUpperCase().includes("DAMPEN");

                // Note: In GritStateProvider, we mapped 'votesFor' to resonance.amplify and 'votesAgainst' to resonance.dampen
                const yesVotes = p.resonance?.amplify || 0;
                const noVotes = p.resonance?.dampen || 0;
                const voteDelta = yesVotes - noVotes;

                if (isAmplify) {
                    // Amplify: YES raises vol, NO lowers vol
                    netImpact += voteDelta;
                } else if (isDampen) {
                    // Dampen: YES lowers vol, NO raises vol
                    netImpact -= voteDelta;
                }
            });

            // Apply Impact: 0.005 gain per vote unit (?)
            // Assuming 100 votes = 0.5 gain shift.
            const VOTE_SENSITIVITY = 0.005;
            const baseGain = 1.0;
            const finalGain = Math.max(0.0, Math.min(1.25, baseGain + (netImpact * VOTE_SENSITIVITY)));

            newGains[stemKey as keyof typeof newGains] = finalGain;
        });

        setGains(newGains);
    }, [proposals]);

    // ... (Keep existing L2E Effect)
    useEffect(() => {
        let interval: NodeJS.Timeout;
        if (isPlaying && currentTrack) {
            interval = setInterval(() => {
                const EARNING_RATE_PER_PULSE = 0.1;
                addResonance(EARNING_RATE_PER_PULSE);
            }, 5000);
        }
        return () => clearInterval(interval);
    }, [isPlaying, currentTrack, addResonance]);

    // ... (Keep visual helpers getTierGlow, getTierBadge)
    const getTierGlow = () => {
        if (!currentTrack) return "shadow-xl shadow-gray-500/30 border-gray-500/30";
        switch (currentTrack?.rarity?.toLowerCase() || 'common') {
            case "legendary": return "shadow-2xl shadow-yellow-500/50 border-yellow-500/50";
            case "epic": return "shadow-2xl shadow-purple-500/50 border-purple-500/50";
            case "rare": return "shadow-2xl shadow-blue-500/50 border-blue-500/50";
            default: return "shadow-xl shadow-gray-500/30 border-gray-500/30";
        }
    };

    const getTierBadge = () => {
        if (!currentTrack) return { label: "COMMON", color: "from-gray-400 to-gray-600" };
        switch (currentTrack?.rarity?.toLowerCase() || 'common') {
            case "legendary": return { label: "LEGENDARY", color: "from-yellow-400 to-orange-500" };
            case "epic": return { label: "EPIC", color: "from-purple-400 to-pink-500" };
            case "rare": return { label: "RARE", color: "from-blue-400 to-cyan-500" };
            default: return { label: "COMMON", color: "from-gray-400 to-gray-600" };
        }
    };

    // Manual Fallback for Demo (Bypasses Config Cache Issues)
    const MANUAL_STEMS: Record<string, any> = {
        "CRUSH": {
            vox1: "/music/CRUSH%20TRACKOUT/WZRDCRUSH_vox1.wav",
            inout: "/music/CRUSH%20TRACKOUT/WZRDCRUSH_in_out1.wav",
            adlibs: "/music/CRUSH%20TRACKOUT/WZRDCRUSH_adlibs.wav",
            bgvox: "/music/CRUSH%20TRACKOUT/WZRDCRUSH_in_out2.wav",
            inst: "/music/CRUSH%20TRACKOUT/WZRDCRUSH_instrumental.wav"
        }
    };

    // Detect Stems (Config or Manual)
    const manualConfig = Object.entries(MANUAL_STEMS).find(([k]) => currentTrack?.title?.toUpperCase().includes(k))?.[1];

    const stems = {
        vox1: currentTrack?.stem_vox1 || manualConfig?.vox1,
        inout: currentTrack?.stem_inout || manualConfig?.inout,
        adlibs: currentTrack?.stem_adlibs || manualConfig?.adlibs,
        bgvox: currentTrack?.stem_bgvox || manualConfig?.bgvox,
        inst: currentTrack?.stem_inst || manualConfig?.inst,
    };

    const hasStemsActive = !!stems.inst;

    // RENDER LOGGING
    if (currentTrack) {
        console.log(`[Render] Title: "${currentTrack.title}", hasStemsActive: ${hasStemsActive}, ManualMatch: ${!!manualConfig}`);
    }

    useEffect(() => {
        if (currentTrack) {
            console.log("💿 Track Debug:", {
                title: currentTrack.title,
                hasStemsActive,
                mergedStems: stems,
                uri: currentTrack.uri
            });
        }
    }, [currentTrack, hasStemsActive]);

    // Construct stream URL for Master
    const streamUrl = currentTrack?.uri ||
        currentTrack?.stems?.[0]?.url ||
        (hasAccess ? `/api/music/stream/${currentTrack?.mint}?wallet=${publicKey?.toBase58() || ""}` : null);

    // PLAYBACK LOGIC
    useEffect(() => {
        const refs = hasStemsActive
            ? [vox1Ref.current, inoutRef.current, adlibsRef.current, bgvoxRef.current, instRef.current]
            : [audioRef.current];

        if (isPlaying && currentTrack) {
            // console.log("▶️ Playing Refs:", refs.length);
            refs.forEach(ref => {
                if (ref) {
                    ref.play().catch(e => console.warn("Playback prevented:", e));
                }
            });
        } else {
            refs.forEach(ref => {
                if (ref) ref.pause();
            });
        }
    }, [isPlaying, currentTrack, hasStemsActive, streamUrl]); // Depend on streamUrl only for re-trigger

    // VOLUME & GAINS LOGIC
    useEffect(() => {
        if (hasStemsActive) {
            if (vox1Ref.current) vox1Ref.current.volume = volume * gains.vox1;
            if (inoutRef.current) inoutRef.current.volume = volume * gains.inout;
            if (adlibsRef.current) adlibsRef.current.volume = volume * gains.adlibs;
            if (bgvoxRef.current) bgvoxRef.current.volume = volume * gains.bgvox;
            if (instRef.current) instRef.current.volume = volume * gains.inst;
        } else {
            if (audioRef.current) audioRef.current.volume = volume;
        }
    }, [volume, gains, hasStemsActive]);

    // Handle wallet disconnect
    useEffect(() => {
        if (currentTrack && !publicKey) stopTrack();
    }, [publicKey, stopTrack, currentTrack]);

    const handleSeek = (e: React.ChangeEvent<HTMLInputElement>) => {
        const newTime = Number(e.target.value);
        if (hasStemsActive) {
            [vox1Ref.current, inoutRef.current, adlibsRef.current, bgvoxRef.current, instRef.current].forEach(ref => {
                if (ref) ref.currentTime = newTime;
            });
        } else if (audioRef.current) {
            audioRef.current.currentTime = newTime;
        }
        setCurrentTime(newTime);
    };

    // ... (Keep playNext/Prev/Toggle/Reward logic)
    const playNext = () => {
        if (!tracks || tracks.length === 0) return;
        const currentIndex = tracks.findIndex(t => t.mint === currentTrack?.mint);
        const nextIndex = (currentIndex === -1 || currentIndex === tracks.length - 1) ? 0 : currentIndex + 1;
        playTrack(tracks[nextIndex]);
    };

    const playPrevious = () => {
        if (!tracks || tracks.length === 0) return;
        const currentIndex = tracks.findIndex(t => t.mint === currentTrack?.mint);
        const prevIndex = currentIndex > 0 ? currentIndex - 1 : tracks.length - 1;
        playTrack(tracks[prevIndex]);
    };

    const togglePlay = () => {
        if (isPlaying) stopTrack();
        else {
            if (!publicKey) return alert("Connect Wallet");
            if (!hasAccess) return alert("Insufficient GRIT");
            if (currentTrack) playTrack(currentTrack);
        }
    };

    // Time Update (Driven by Instrumental or Master)
    const synchronizeStems = () => {
        if (!hasStemsActive || !instRef.current) return;
        const masterTime = instRef.current.currentTime;
        const SYNC_THRESHOLD = 0.05; // 50ms

        [vox1Ref.current, inoutRef.current, adlibsRef.current, bgvoxRef.current].forEach(ref => {
            if (ref && Math.abs(ref.currentTime - masterTime) > SYNC_THRESHOLD) {
                // console.log("🔄 Syncing stem:", Math.abs(ref.currentTime - masterTime));
                ref.currentTime = masterTime;
            }
        });
    };

    const handleTimeUpdate = () => {
        const driver = hasStemsActive ? instRef.current : audioRef.current;
        if (driver) {
            setCurrentTime(driver.currentTime);
            setDuration(driver.duration || 0);

            if (hasStemsActive) synchronizeStems();

            // Reward Logic (Simplified)
            // ... (keep existing reward trigger if needed)
        }
    };

    const handleLoadedMetadata = () => {
        const driver = hasStemsActive ? instRef.current : audioRef.current;
        if (driver) setDuration(driver.duration);
    };

    const formatTime = (time: number) => {
        if (isNaN(time) || !time) return "0:00";
        const m = Math.floor(time / 60);
        const s = Math.floor(time % 60);
        return `${m}:${s.toString().padStart(2, "0")}`;
    };

    if (!currentTrack) return null;
    const isOwned = ownedMints.has(currentTrack.mint);
    const tierBadge = getTierBadge();

    return (
        <>
            {/* HIDDEN AUDIO ELEMENTS */}
            {hasStemsActive ? (
                <>
                    <audio ref={vox1Ref} src={stems.vox1} preload="auto" />
                    <audio ref={inoutRef} src={stems.inout} preload="auto" />
                    <audio ref={adlibsRef} src={stems.adlibs} preload="auto" />
                    <audio ref={bgvoxRef} src={stems.bgvox} preload="auto" />
                    <audio ref={instRef} src={stems.inst} preload="auto" onTimeUpdate={handleTimeUpdate} onLoadedMetadata={handleLoadedMetadata} onEnded={playNext} />
                </>
            ) : (
                <audio
                    ref={audioRef}
                    src={streamUrl || undefined}
                    preload="auto"
                    onTimeUpdate={handleTimeUpdate}
                    onLoadedMetadata={handleLoadedMetadata}
                    onEnded={playNext}
                    onError={(e) => {
                        console.error("Audio Error Details:", {
                            src: e.currentTarget.src,
                            error: e.currentTarget.error,
                            code: e.currentTarget.error?.code,
                            message: e.currentTarget.error?.message,
                            networkState: e.currentTarget.networkState
                        });
                    }}
                />
            )}

            {/* COMPACT PLAYER */}
            {!isExpanded && (
                <div className="fixed bottom-0 left-0 right-0 bg-gray-900/95 border-t border-purple-500/30 backdrop-blur-lg z-50 pb-[env(safe-area-inset-bottom)]">
                    <div className="max-w-7xl mx-auto px-4 py-3">
                        <div className="flex items-center gap-4">
                            <div className={`w-14 h-14 flex items-center justify-center bg-gray-800 border-2 ${getTierGlow()} cursor-pointer`} onClick={() => setIsExpanded(true)}>
                                <span className="text-2xl">⚡</span>
                            </div>
                            <div className="flex-1 min-w-0">
                                <h4 className="text-white font-bold truncate">{currentTrack.title}</h4>
                                <p className="text-gray-400 text-sm">WZRD {hasStemsActive && <span className="text-xs text-purple-400 border border-purple-400 px-1 rounded ml-2">STEMS ACTIVE</span>}</p>
                            </div>
                            <div className="flex items-center gap-3">
                                <button onClick={playPrevious} className="text-gray-400 hover:text-white p-2">⏮</button>
                                <button onClick={togglePlay} className="text-white hover:text-purple-400 p-2">{isPlaying ? "⏸" : "▶️"}</button>
                                <button onClick={playNext} className="text-gray-400 hover:text-white p-2">⏭</button>
                                <button onClick={() => setIsExpanded(true)} className="text-gray-400 hover:text-white p-2 ml-2">⬆️</button>
                            </div>
                        </div>
                        <div className="mt-2 mb-1">
                            <input type="range" min="0" max={duration || 0} value={currentTime} onChange={handleSeek} className="w-full h-1 bg-gray-700 rounded-lg appearance-none cursor-pointer"
                                style={{ background: `linear-gradient(to right, #9333ea 0%, #9333ea ${(currentTime / duration) * 100}%, #374151 ${(currentTime / duration) * 100}%, #374151 100%)` }} />
                        </div>
                    </div>
                </div>
            )}

            {/* EXPANDED PLAYER */}
            {isExpanded && (
                <div className="fixed inset-0 bg-gradient-to-br from-gray-900 via-purple-900 to-black z-50 flex items-center justify-center p-8 pb-[calc(2rem+env(safe-area-inset-bottom))]">
                    <div className="max-w-2xl w-full">
                        <button onClick={() => setIsExpanded(false)} className="absolute top-safe right-4 text-white hover:text-purple-400 text-2xl p-4">✕</button>

                        <div className="flex justify-center mb-4"><div className={`px-4 py-2 rounded-full bg-gradient-to-r ${tierBadge.color} text-white font-bold text-sm shadow-lg`}>{tierBadge.label} • {gritBalance.toLocaleString()} GRIT</div></div>

                        <div className={`relative w-full aspect-video md:aspect-square rounded-2xl bg-black/50 mb-8 border-4 flex items-center justify-center ${getTierGlow()}`}>
                            <div className="text-center animate-pulse">
                                <span className="text-6xl opacity-50">📡</span>
                                <p className="text-gray-500 font-mono mt-4 text-xs uppercase tracking-widest">Signal Transmission Active</p>
                            </div>
                            {hasStemsActive && (
                                <div className="absolute top-4 left-4 flex flex-col gap-2">
                                    {/* STEM MIXER DEV UI */}
                                    {Object.entries(gains).map(([key, gain]) => (
                                        <div key={key} className="flex items-center gap-2 bg-black/60 px-2 py-1 rounded">
                                            <span className="text-[10px] text-purple-400 font-mono w-12 uppercase">{key}</span>
                                            <div className="w-16 h-1 bg-gray-700 rounded relative">
                                                <div className="absolute left-0 top-0 bottom-0 bg-purple-500 rounded" style={{ width: `${gain * 100}%` }} />
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </div>

                        <div className="text-center mb-8">
                            <h2 className="text-4xl font-bold text-white mb-2">{currentTrack.title}</h2>
                            <p className="text-gray-400 text-xl">WZRD {hasStemsActive && "(5-Channel)"}</p>
                        </div>

                        <div className="mb-6">
                            <input type="range" min="0" max={duration || 0} value={currentTime} onChange={handleSeek} className="w-full h-2 bg-gray-700 rounded-lg appearance-none cursor-pointer"
                                style={{ background: `linear-gradient(to right, #9333ea 0%, #9333ea ${(currentTime / duration) * 100}%, #374151 ${(currentTime / duration) * 100}%, #374151 100%)` }} />
                            <div className="flex justify-between text-gray-400 text-sm mt-2"><span>{formatTime(currentTime)}</span><span>{formatTime(duration)}</span></div>
                        </div>

                        <div className="flex items-center justify-center gap-8 mb-6">
                            <button onClick={playPrevious} className="text-gray-400 hover:text-white text-2xl p-4">⏮</button>
                            <button onClick={togglePlay} className="w-16 h-16 rounded-full bg-purple-600 hover:bg-purple-700 flex items-center justify-center text-3xl transition-colors">{isPlaying ? "⏸" : "▶️"}</button>
                            <button onClick={playNext} className="text-gray-400 hover:text-white text-2xl p-4">⏭</button>
                        </div>

                        <div className="flex items-center gap-4">
                            <span className="text-gray-400">🔊</span>
                            <input type="range" min="0" max="1" step="0.01" value={volume} onChange={(e) => setVolume(parseFloat(e.target.value))} className="flex-1 h-1 bg-gray-700 rounded-lg appearance-none cursor-pointer" />
                        </div>
                    </div>
                </div>
            )}
        </>
    );
}
