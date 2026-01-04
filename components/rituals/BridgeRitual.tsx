"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import WithdrawalScreen from "./withdrawal/WithdrawalScreen"; // Reuse existing
import { ArrowLeftRight, ArrowRight, ArrowLeft } from "lucide-react";

type BridgeMode = "ENTER" | "LEAVE" | "IDLE";

export default function BridgeRitual() {
    const [mode, setMode] = useState<BridgeMode>("IDLE");

    return (
        <div className="min-h-[60vh] flex flex-col items-center justify-center p-4">

            <AnimatePresence mode="wait">
                {mode === "IDLE" && (
                    <motion.div
                        key="idle"
                        initial={{ opacity: 0, scale: 0.9 }}
                        animate={{ opacity: 1, scale: 1 }}
                        exit={{ opacity: 0, scale: 0.9 }}
                        className="flex flex-col md:flex-row gap-8"
                    >
                        {/* ENTER CARD */}
                        <button
                            onClick={() => setMode("ENTER")}
                            className="group glass-panel p-8 rounded-3xl border border-white/5 hover:border-green-500/30 transition-all text-left w-full md:w-80 flex flex-col justify-between h-64 bg-black/40"
                        >
                            <div>
                                <span className="text-xs font-bold text-green-500 uppercase tracking-widest mb-2 block">Inhale</span>
                                <h3 className="text-3xl font-black text-white mb-2">Use Grit</h3>
                                <p className="text-gray-400 text-sm leading-relaxed">
                                    Step into the Rehearsal. Convert SOL to GRIT to participate in the ecosystem.
                                </p>
                            </div>
                            <div className="flex justify-end">
                                <div className="w-10 h-10 rounded-full bg-green-500/20 text-green-400 flex items-center justify-center group-hover:bg-green-500 group-hover:text-black transition-colors">
                                    <ArrowRight />
                                </div>
                            </div>
                        </button>

                        {/* LEAVE CARD */}
                        <button
                            onClick={() => setMode("LEAVE")}
                            className="group glass-panel p-8 rounded-3xl border border-white/5 hover:border-red-500/30 transition-all text-left w-full md:w-80 flex flex-col justify-between h-64 bg-black/40"
                        >
                            <div>
                                <span className="text-xs font-bold text-red-500 uppercase tracking-widest mb-2 block">Exhale</span>
                                <h3 className="text-3xl font-black text-white mb-2">Release</h3>
                                <p className="text-gray-400 text-sm leading-relaxed">
                                    Release breath back into the world. Convert eligible GRIT back to SOL.
                                </p>
                            </div>
                            <div className="flex justify-end">
                                <div className="w-10 h-10 rounded-full bg-red-500/20 text-red-400 flex items-center justify-center group-hover:bg-red-500 group-hover:text-black transition-colors">
                                    <ArrowLeft />
                                </div>
                            </div>
                        </button>
                    </motion.div>
                )}

                {mode === "ENTER" && (
                    <motion.div
                        key="enter"
                        initial={{ opacity: 0, x: 20 }}
                        animate={{ opacity: 1, x: 0 }}
                        exit={{ opacity: 0, x: -20 }}
                        className="w-full max-w-md"
                    >
                        <div className="mb-4">
                            <button onClick={() => setMode("IDLE")} className="text-gray-500 hover:text-white flex items-center gap-2 text-sm uppercase font-bold tracking-widest transition-colors">
                                <ArrowLeft size={16} /> Back
                            </button>
                        </div>

                        <div className="glass-panel p-8 rounded-3xl border border-white/10 bg-black/80">
                            <h2 className="text-2xl font-black text-white mb-4">Entering Rehearsal</h2>
                            <p className="text-gray-400 mb-8 leading-relaxed">
                                You are exchanging raw value (SOL) for instrumental utility (GRIT).
                                <br /><br />
                                <b>This is a one-way transmutation until eligibility is met.</b>
                                <br />There is no guarantee of immediate exit.
                            </p>

                            {/* Placeholder for Swap UI */}
                            <div className="p-4 bg-white/5 rounded-xl border border-white/5 text-center text-gray-500 font-mono text-sm mb-6">
                                [SWAP INTERFACE GOES HERE]
                            </div>

                            <button className="w-full py-4 bg-white text-black font-bold uppercase tracking-widest rounded-full hover:bg-green-400 transition-colors">
                                Confirm Entry
                            </button>
                        </div>
                    </motion.div>
                )}

                {mode === "LEAVE" && (
                    <motion.div
                        key="leave"
                        initial={{ opacity: 0, x: 20 }}
                        animate={{ opacity: 1, x: 0 }}
                        exit={{ opacity: 0, x: -20 }}
                        className="w-full"
                    >
                        <div className="mb-4 max-w-md mx-auto">
                            <button onClick={() => setMode("IDLE")} className="text-gray-500 hover:text-white flex items-center gap-2 text-sm uppercase font-bold tracking-widest transition-colors">
                                <ArrowLeft size={16} /> Back
                            </button>
                        </div>
                        <WithdrawalScreen />
                    </motion.div>
                )}
            </AnimatePresence>

        </div>
    );
}
