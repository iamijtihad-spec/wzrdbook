"use client";

import Navigation from "@/components/Navigation";
import { VoiceTerminal } from "@/components/governance/VoiceTerminal";
import { motion } from "framer-motion";
import { Mic } from "lucide-react";
import { useRouter } from "next/navigation";

export default function VoicePage() {
    const router = useRouter();

    return (
        <div className="min-h-screen bg-black text-white selection:bg-[#d4af37]/30">
            {/* BACKGROUND ELEMENTS */}
            <div className="absolute inset-0 bg-[url('/bg-texture.png')] opacity-5 pointer-events-none mix-blend-overlay" />

            <Navigation />

            <main className="relative z-10 pt-32 px-4 pb-20">
                <div className="max-w-6xl mx-auto">
                    {/* Header */}
                    <motion.div
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="mb-12 flex items-center gap-4"
                    >
                        <div>
                            <div className="text-[#555] text-xs uppercase tracking-[0.3em] mb-1">Domain // Voice</div>
                            <h1 className="text-4xl font-serif font-bold text-[#d4af37] flex items-center gap-3">
                                <Mic className="w-8 h-8" /> THE VOICE
                            </h1>
                            <p className="text-[#888] font-mono text-sm mt-2">
                                Governance Protocol. One Token, One Voice. Multiplied by Time.
                            </p>
                        </div>
                    </motion.div>

                    {/* Content */}
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.2 }}
                    >
                        <VoiceTerminal />
                    </motion.div>
                </div>
            </main>
        </div>
    );
}
