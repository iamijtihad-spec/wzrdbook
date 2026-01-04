"use client";

import React from "react";
import { motion } from "framer-motion";
import ParticleField from "@/components/ui/ParticleField";
import TheVault from "@/components/domain/heritage/TheVault";
import Navigation from "@/components/Navigation";
import { Gem } from "lucide-react";

import DomainGate from "@/components/gating/DomainGate";
import { Domain } from "@/lib/domain-gates";

export default function HeritagePage() {
    return (
        <DomainGate domain={Domain.HERITAGE}>
            <div className="min-h-screen bg-[#050505] text-[#d4af37] selection:bg-[#d4af37]/30 overflow-hidden relative font-sans">
                {/* AMBIENCE: Gold Embers */}
                <ParticleField color="#d4af37" density={40} speed={0.5} direction="up" />

                {/* Background Texture: Concrete & Noise */}
                <div className="absolute inset-0 opacity-10 pointer-events-none bg-[url('https://www.transparenttextures.com/patterns/concrete-wall.png')] mix-blend-overlay"></div>
                <div className="absolute inset-0 bg-gradient-to-b from-black via-transparent to-black pointer-events-none"></div>

                <Navigation />

                <main className="relative z-10 flex flex-col items-center justify-center min-h-screen px-4 pt-20">
                    <motion.div
                        initial={{ opacity: 0, y: 30 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.8, ease: "easeOut" }}
                        className="text-center mb-12"
                    >
                        <Gem className="w-12 h-12 mx-auto mb-6 text-[#d4af37] opacity-80" />
                        <h1 className="text-5xl md:text-7xl font-serif font-bold tracking-tight text-[#e0c060] drop-shadow-[0_0_15px_rgba(212,175,55,0.3)]">
                            HERITAGE
                        </h1>
                        <div className="h-px w-32 bg-gradient-to-r from-transparent via-[#d4af37] to-transparent mx-auto my-6" />
                        <p className="text-sm md:text-base text-[#888] tracking-[0.3em] uppercase max-w-lg mx-auto leading-loose">
                            This is not a place of consumption.<br />
                            It is a place of custodianship.
                        </p>
                    </motion.div>

                    {/* THE VAULT INTERFACE */}
                    <motion.div
                        initial={{ opacity: 0, scale: 0.95 }}
                        animate={{ opacity: 1, scale: 1 }}
                        transition={{ delay: 0.4, duration: 0.8 }}
                        className="w-full"
                    >
                        <TheVault />
                    </motion.div>
                </main>
            </div>
        </DomainGate>
    );
}
