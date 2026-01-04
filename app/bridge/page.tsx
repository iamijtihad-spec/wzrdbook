"use client";

import Navigation from "@/components/Navigation";
import { useState } from "react";
import { Scan, Cpu, Loader2, CheckCircle, XCircle } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

export default function BridgePage() {
    const [status, setStatus] = useState<'idle' | 'scanning' | 'verified' | 'failed'>('idle');
    const [meta, setMeta] = useState<any>(null);

    const handleSimulateScan = async () => {
        setStatus('scanning');

        // Simulate NFC Delay
        await new Promise(r => setTimeout(r, 2000));

        try {
            const res = await fetch("/api/verify-nfc", {
                method: "POST",
                body: JSON.stringify({ chipId: "THE_TABLET" })
            });
            const data = await res.json();

            if (data.success) {
                setMeta(data.meta);
                setStatus('verified');
            } else {
                setStatus('failed');
            }
        } catch (e) {
            setStatus('failed');
        }
    };

    return (
        <div className="bg-black min-h-screen text-white selection:bg-cyan-500/30">
            {/* Ambient Background */}
            <div className="absolute inset-0 bg-[#000] z-0">
                <div className="absolute top-0 left-0 w-full h-96 bg-gradient-to-b from-cyan-900/10 to-transparent" />
            </div>

            <Navigation />

            <main className="relative z-10 pt-32 px-4 pb-20 max-w-2xl mx-auto text-center">

                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="mb-12"
                >
                    <div className="text-cyan-500 text-xs tracking-[0.3em] font-mono mb-2">THE BRIDGE</div>
                    <h1 className="text-4xl font-bold text-white mb-4">Physical Verification</h1>
                    <p className="text-[#888]">Bring your artifact close to the receiver.</p>
                </motion.div>

                <div className="relative w-64 h-64 mx-auto mb-12 flex items-center justify-center">
                    {/* Ring Animations */}
                    <div className={`absolute inset-0 border-2 rounded-full transition-all duration-1000 ${status === 'scanning' ? 'border-cyan-500 scale-110 animate-pulse' : 'border-[#333]'}`} />
                    <div className={`absolute inset-4 border border-dashed rounded-full transition-all duration-[3s] ${status === 'scanning' ? 'border-cyan-500/50 rotate-180' : 'border-[#333]'}`} />
                    <div className={`absolute inset-8 border border-[#222] rounded-full`} />

                    <AnimatePresence mode="wait">
                        {status === 'idle' && (
                            <motion.button
                                key="scan-btn"
                                initial={{ scale: 0.9, opacity: 0 }}
                                animate={{ scale: 1, opacity: 1 }}
                                exit={{ scale: 0.9, opacity: 0 }}
                                onClick={handleSimulateScan}
                                className="w-32 h-32 rounded-full bg-[#111] border border-[#333] hover:border-cyan-500 hover:shadow-[0_0_30px_rgba(6,182,212,0.3)] transition-all flex flex-col items-center justify-center gap-2 group cursor-pointer"
                            >
                                <Scan className="w-8 h-8 text-[#555] group-hover:text-cyan-400 transition-colors" />
                                <span className="text-[10px] uppercase tracking-widest text-[#555] group-hover:text-white">Scan</span>
                            </motion.button>
                        )}

                        {status === 'scanning' && (
                            <motion.div
                                key="scanning"
                                initial={{ opacity: 0 }}
                                animate={{ opacity: 1 }}
                                exit={{ opacity: 0 }}
                                className="flex flex-col items-center gap-2"
                            >
                                <Loader2 className="w-10 h-10 text-cyan-500 animate-spin" />
                                <span className="text-xs text-cyan-500 font-mono animate-pulse">READING CHIP...</span>
                            </motion.div>
                        )}

                        {status === 'verified' && (
                            <motion.div
                                key="verified"
                                initial={{ scale: 0.5, opacity: 0 }}
                                animate={{ scale: 1, opacity: 1 }}
                                className="flex flex-col items-center gap-2"
                            >
                                <CheckCircle className="w-16 h-16 text-cyan-400 mb-2" />
                            </motion.div>
                        )}
                    </AnimatePresence>
                </div>

                {/* Meta Card */}
                <AnimatePresence>
                    {status === 'verified' && meta && (
                        <motion.div
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            className="bg-[#111] border border-cyan-900/50 p-6 rounded-xl text-left max-w-sm mx-auto"
                        >
                            <div className="flex items-start justify-between mb-4">
                                <div>
                                    <div className="text-cyan-500 text-[10px] tracking-widest uppercase mb-1">Authenticated</div>
                                    <div className="text-xl font-bold text-white">{meta.name}</div>
                                </div>
                                <Cpu className="w-6 h-6 text-cyan-900" />
                            </div>
                            <div className="space-y-2 text-sm text-[#888] font-mono">
                                <div className="flex justify-between border-b border-[#222] pb-1">
                                    <span>Edition</span>
                                    <span className="text-white">{meta.edition}</span>
                                </div>
                                <div className="flex justify-between border-b border-[#222] pb-1">
                                    <span>Rarity</span>
                                    <span className="text-white">{meta.rarity}</span>
                                </div>
                            </div>
                            <button
                                onClick={() => setStatus('idle')}
                                className="w-full mt-6 py-3 bg-[#222] hover:bg-cyan-900/30 text-white font-bold text-xs uppercase tracking-widest transition-colors"
                            >
                                Scan Another
                            </button>
                        </motion.div>
                    )}
                </AnimatePresence>

            </main>
        </div>
    );
}
