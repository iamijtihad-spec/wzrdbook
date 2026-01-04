"use client";
import React from "react";
import { motion } from "framer-motion";
import ParticleField from "@/components/ui/ParticleField";
import GlitchText from "@/components/ui/GlitchText";
import ThePyre from "@/components/domain/ascesis/ThePyre";
import Navigation from "@/components/Navigation";
import { Shield, Flame, AlertTriangle } from "lucide-react";
import { useGritState } from "@/components/GritStateProvider";
import DomainGate from "@/components/gating/DomainGate";
import TheIncubator from "@/components/domain/ascesis/TheIncubator";
import ArtifactScanner from "@/components/domain/ascesis/ArtifactScanner";
import { Domain } from "@/lib/domain-gates";

export default function AscesisPage() {
    const { currentDomain, scars, resonance, creatureMint } = useGritState();

    return (
        <DomainGate domain={Domain.ASCESIS}>
            <div className="min-h-screen bg-black text-white selection:bg-red-500/30 overflow-hidden relative font-mono">
                {/* AMBIENCE */}
                <ParticleField color="#ef4444" density={80} speed={2} direction="down" />
                <div className="absolute inset-0 bg-gradient-to-b from-red-900/10 via-black to-black pointer-events-none"></div>

                {/* SCANLINE OVERLAY */}
                <div className="absolute inset-0 pointer-events-none z-[1]" style={{
                    background: "linear-gradient(rgba(18, 16, 16, 0) 50%, rgba(0, 0, 0, 0.25) 50%), linear-gradient(90deg, rgba(255, 0, 0, 0.06), rgba(0, 255, 0, 0.02), rgba(0, 0, 255, 0.06))",
                    backgroundSize: "100% 2px, 3px 100%"
                }}></div>

                <Navigation />

                <main className="relative z-10 flex flex-col items-center justify-center min-h-screen px-4 pt-20">
                    <motion.div
                        initial={{ opacity: 0, scale: 1.1 }}
                        animate={{ opacity: 1, scale: 1 }}
                        transition={{ duration: 0.1, repeat: 3, repeatType: "mirror" }} // Glitch entrance
                        className="text-center"
                    >
                        <Shield className="w-16 h-16 text-red-500 mx-auto mb-6 animate-pulse" />
                        <h1 className="text-6xl md:text-8xl font-black tracking-tighter mb-4">
                            <GlitchText text="ASCESIS" size="xl" className="text-red-500" />
                        </h1>
                        <p className="text-xl text-red-500/60 tracking-widest uppercase mb-12 border border-red-500/30 px-4 py-2 inline-block">
                            WARNING: REALITY BREACH DETECTED
                        </p>
                    </motion.div>

                    {/* DASHBOARD GRID */}
                    <div className="grid md:grid-cols-2 gap-8 w-full max-w-4xl">
                        {/* BURN CARD */}
                        <motion.div
                            initial={{ opacity: 0, x: -20 }}
                            animate={{ opacity: 1, x: 0 }}
                            transition={{ delay: 0.3 }}
                            className="glass-panel-red p-8 rounded-none border-l-4 border-l-red-500 relative overflow-hidden group"
                        >
                            <h2 className="text-2xl font-bold mb-4 flex items-center text-red-500">
                                <Flame className="w-6 h-6 mr-3" /> SACRIFICE
                            </h2>
                            <div className="text-4xl font-mono font-bold text-white mb-2">{scars.length} <span className="text-sm text-gray-500">SCARS</span></div>
                            <p className="text-xs text-red-400 mb-6 uppercase tracking-wider">Pain is the price of entry.</p>

                            <button
                                onClick={() => document.getElementById("the-pyre")?.scrollIntoView({ behavior: "smooth" })}
                                className="w-full py-4 bg-red-900/50 hover:bg-red-600 border border-red-500/50 text-white font-bold transition-all hover:tracking-widest"
                            >
                                INITIATE BURN
                            </button>
                        </motion.div>

                        {/* FIREWALL STATUS */}
                        <motion.div
                            initial={{ opacity: 0, x: 20 }}
                            animate={{ opacity: 1, x: 0 }}
                            transition={{ delay: 0.5 }}
                            className="glass-panel p-8 rounded-none border border-red-900/30 relative overflow-hidden group"
                        >
                            <h2 className="text-2xl font-bold mb-4 flex items-center text-gray-400">
                                <AlertTriangle className="w-6 h-6 mr-3" /> FIREWALL
                            </h2>
                            <div className="space-y-4 font-mono text-sm">
                                <div className="flex justify-between items-center text-red-400">
                                    <span>L2E REWARDS</span>
                                    {!currentDomain ? ( // Checking persistence/hydration
                                        <span className="font-bold text-gray-600">[OFFLINE]</span>
                                    ) : (
                                        <div className="text-right">
                                            <span className="font-bold text-green-500 block text-xs tracking-widest">[ACTIVE]</span>
                                            {resonance > 0 && (
                                                <span className="text-xs text-green-400 animate-pulse">
                                                    +{((resonance * 10)).toFixed(0)} GRIT
                                                </span>
                                            )}
                                        </div>
                                    )}
                                </div>
                                <div className="flex justify-between items-center text-green-500">
                                    <span>TRUTH VERIFICATION</span>
                                    <span className="font-bold">[ACTIVE]</span>
                                </div>
                            </div>
                        </motion.div>
                    </div>
                    {/* The Pyre Interface */}
                    <div id="the-pyre" className="mt-12 w-full max-w-4xl space-y-12 mb-24">
                        <ThePyre />

                        {/* THE INCUBATOR (ARCHIVED FEATURE) */}
                        {/* 
                        <div id="incubator" className="pt-12 border-t border-red-500/20">
                            <TheIncubator mint={creatureMint || ""} />
                        </div> 
                        */}

                        {/* ARTIFACT SCANNER */}
                        <div className="pt-12 border-t border-red-500/20">
                            <ArtifactScanner />
                        </div>
                    </div>
                </main>
            </div>
        </DomainGate>
    );
}
