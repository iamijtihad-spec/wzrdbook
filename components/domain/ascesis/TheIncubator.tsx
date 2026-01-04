"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Heart, Zap, Cookie, RefreshCw, Star, Maximize2 } from "lucide-react";
import { CreatureStage } from "@/lib/evolution/types";

import Image from "next/image";

interface IncubatorProps {
    mint: string;
    onEvolve?: (newStage: string) => void;
}

export default function TheIncubator({ mint, onEvolve }: IncubatorProps) {
    const [state, setState] = useState<any>(null);
    const [loading, setLoading] = useState(true);
    const [actionLoading, setActionLoading] = useState(false);
    const [message, setMessage] = useState("");

    const fetchState = async () => {
        if (!mint) return;
        try {
            const res = await fetch(`/api/creature/${mint}`);
            const data = await res.json();
            if (data.success) {
                setState(data.state);
            }
        } catch (e) {
            console.error("Failed to fetch creature:", e);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchState();
        const interval = setInterval(fetchState, 30000); // 30s poll
        return () => clearInterval(interval);
    }, [mint]);

    const handleAction = async (action: "FEED" | "PLAY" | "REST") => {
        if (actionLoading) return;
        setActionLoading(true);
        setMessage("");

        try {
            const res = await fetch("/api/evolution/interact", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ mint, action })
            });
            const data = await res.json();
            if (data.success) {
                if (data.newState.stage !== state.stage && onEvolve) {
                    onEvolve(data.newState.stage);
                }
                setState(data.newState);
                setMessage(`Action Successful: ${action}`);
            } else {
                setMessage(`Error: ${data.error}`);
            }
        } catch (e: any) {
            setMessage("Connection Failed");
        } finally {
            setActionLoading(false);
            setTimeout(() => setMessage(""), 3000);
        }
    };

    if (loading) return (
        <div className="w-full h-96 flex items-center justify-center bg-black/40 border border-red-500/20 rounded-xl">
            <RefreshCw className="w-8 h-8 text-red-500 animate-spin" />
        </div>
    );

    if (!state) return (
        <div className="w-full p-12 text-center bg-black/40 border border-red-500/20 rounded-xl font-mono">
            <Maximize2 className="w-12 h-12 text-red-500/40 mx-auto mb-4" />
            <p className="text-red-500/60 uppercase tracking-widest text-sm">The Progeny sleeps.</p>
            <p className="text-xs text-gray-500 mt-2">Inside sleeps a creature called The Progeny—a living mirror of your devotion.</p>
        </div>
    );



    const getStageAsset = () => {
        switch (state.stage) {
            case "Egg": return "/images/evolution/egg.png";
            case "Baby": return "/images/evolution/baby.png";
            case "Teen": return "/images/evolution/teen.png";
            case "Adult": return "/images/evolution/adult.png";
            case "Elder": return "/images/evolution/elder.png";
            default: return "/images/evolution/egg.png";
        }
    };

    return (
        <div className="w-full max-w-2xl mx-auto p-8 bg-black/60 backdrop-blur-xl border border-red-500/30 rounded-none relative overflow-hidden group">
            {/* Ambient Background */}
            <div className="absolute inset-0 bg-gradient-to-t from-red-900/10 to-transparent pointer-events-none" />

            <div className="relative z-10">
                <div className="flex justify-between items-start mb-12">
                    <div>
                        <h3 className="text-2xl font-black text-red-500 tracking-tighter flex items-center gap-2 uppercase">
                            <Star className="w-5 h-5 fill-red-500" /> THE INCUBATOR
                        </h3>
                        <p className="text-[10px] text-gray-500 font-mono tracking-widest mt-1">SECTOR: ASCESIS // SUBJECT: {mint.slice(0, 8)}...</p>
                    </div>
                    <div className="text-right font-mono">
                        <div className="text-xs text-gray-500 uppercase tracking-widest">Stage</div>
                        <div className="text-xl text-white font-black uppercase tracking-tighter">{state.stage}</div>
                        <div className="text-[10px] text-red-500/60 font-bold mt-1">LVL {state.level}</div>
                    </div>
                </div>

                <div className="flex flex-col md:flex-row gap-12 items-center">
                    {/* Visualizer */}
                    <div className="relative w-64 h-64 bg-black/40 border border-red-500/10 flex items-center justify-center rounded-full overflow-hidden shadow-[0_0_50px_rgba(239,68,68,0.1)] group-hover:border-red-500/30 transition-all">
                        <motion.div
                            animate={{
                                scale: [0.95, 1.05, 0.95],
                                opacity: [0.8, 1, 0.8],
                                rotate: state.stage === "Egg" ? [0, 5, -5, 0] : 0
                            }}
                            transition={{ duration: 4, repeat: Infinity }}
                            className="relative w-full h-full p-8"
                        >
                            <Image
                                src={getStageAsset()}
                                alt={state.stage}
                                fill
                                className="object-contain drop-shadow-[0_0_15px_rgba(239,68,68,0.5)]"
                            />
                        </motion.div>
                        <div className="absolute inset-0 border-4 border-red-500/5 rounded-full animate-ping pointer-events-none" />
                    </div>

                    {/* Stats */}
                    <div className="flex-1 w-full space-y-6">
                        {/* XP Bar */}
                        <div>
                            <div className="flex justify-between text-[10px] uppercase font-bold tracking-widest text-gray-400 mb-2">
                                <span>Experience</span>
                                <span>{state.xp % 100}/100</span>
                            </div>
                            <div className="h-2 bg-gray-900 w-full overflow-hidden border border-white/5">
                                <motion.div
                                    initial={{ width: 0 }}
                                    animate={{ width: `${state.xp % 100}%` }}
                                    className="h-full bg-red-500 shadow-[0_0_10px_rgba(239,68,68,0.5)]"
                                />
                            </div>
                        </div>

                        {/* Stat Grid */}
                        <div className="grid grid-cols-3 gap-4">
                            <StatBar icon={<Cookie className="w-3 h-3" />} label="Hunger" value={state.hunger} color="text-orange-400" bgColor="bg-orange-400" />
                            <StatBar icon={<Zap className="w-3 h-3" />} label="Stamina" value={state.stamina} color="text-yellow-400" bgColor="bg-yellow-400" />
                            <StatBar icon={<Heart className="w-3 h-3" />} label="Joy" value={state.happiness} color="text-pink-400" bgColor="bg-pink-400" />
                        </div>
                    </div>
                </div>

                {/* Actions */}
                <div className="mt-12 pt-8 border-t border-red-500/10 grid grid-cols-3 gap-4">
                    <ActionButton icon={<Cookie />} label="Feed" onClick={() => handleAction("FEED")} loading={actionLoading} disabled={state.hunger >= 100} />
                    <ActionButton icon={<Zap />} label="Play" onClick={() => handleAction("PLAY")} loading={actionLoading} disabled={state.stamina < 15} />
                    <ActionButton icon={<RefreshCw />} label="Rest" onClick={() => handleAction("REST")} loading={actionLoading} disabled={state.stamina >= 100} />
                </div>

                <AnimatePresence>
                    {message && (
                        <motion.div
                            initial={{ opacity: 0, y: 10 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0 }}
                            className="text-center mt-6 text-[10px] font-mono uppercase tracking-widest text-red-500/80"
                        >
                            [ {message} ]
                        </motion.div>
                    )}
                </AnimatePresence>
            </div>
        </div>
    );
}

function StatBar({ icon, label, value, color, bgColor }: any) {
    return (
        <div className="space-y-2">
            <div className={`flex items-center gap-1 ${color} text-[8px] font-bold uppercase tracking-widest`}>
                {icon} {label}
            </div>
            <div className="h-1 bg-gray-900 w-full border border-white/5">
                <motion.div
                    animate={{ width: `${value}%` }}
                    className={`h-full ${bgColor}`}
                />
            </div>
        </div>
    );
}

function ActionButton({ icon, label, onClick, loading, disabled }: any) {
    return (
        <button
            onClick={onClick}
            disabled={loading || disabled}
            className="flex flex-col items-center gap-2 p-4 bg-white/5 border border-white/10 hover:bg-red-500/10 hover:border-red-500/50 transition-all group disabled:opacity-20 disabled:grayscale disabled:cursor-not-allowed"
        >
            <div className={`text-gray-400 group-hover:text-red-500 ${loading ? 'animate-spin' : ''}`}>
                {icon}
            </div>
            <span className="text-[10px] text-gray-500 group-hover:text-white font-mono uppercase tracking-widest">{label}</span>
        </button>
    );
}
