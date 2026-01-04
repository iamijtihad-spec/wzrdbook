"use client";

import { motion } from "framer-motion";
import Navigation from "@/components/Navigation";
import { BondingTerm } from "@/components/market/BondingTerm";
import { TrendingUp, ArrowLeft } from "lucide-react";
import { useRouter } from "next/navigation";

import DomainGate from "@/components/gating/DomainGate";
import { Domain } from "@/lib/domain-gates";

export default function MarketPage() {
    const router = useRouter();

    return (
        <DomainGate domain={Domain.MARKET}>
            <div className="min-h-screen bg-black text-white selection:bg-[#d4af37]/30">
                {/* BACKGROUND ELEMENTS */}
                <div className="absolute inset-0 bg-[url('/bg-texture.png')] opacity-5 pointer-events-none mix-blend-overlay" />

                <Navigation />

                <main className="relative z-10 pt-32 px-4 pb-20">
                    <div className="max-w-6xl mx-auto">

                        {/* Header */}
                        <div className="mb-12 flex items-center gap-4">
                            <button onClick={() => router.push("/")} className="p-2 hover:bg-[#1a1a1a] rounded-full transition-colors">
                                <ArrowLeft className="w-6 h-6 text-[#555] hover:text-[#d4af37]" />
                            </button>
                            <div>
                                <div className="text-[#555] text-xs uppercase tracking-[0.3em] mb-1">Domain // Market</div>
                                <h1 className="text-4xl font-serif font-bold text-[#d4af37] flex items-center gap-3">
                                    <TrendingUp className="w-8 h-8" /> THE MARKET
                                </h1>
                            </div>
                        </div>

                        {/* Content */}
                        <motion.div
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ duration: 0.6 }}
                        >
                            <BondingTerm />
                        </motion.div>

                        {/* Footer / Context */}
                        <div className="mt-12 text-center text-[#555] text-xs font-mono max-w-2xl mx-auto">
                            <p>ACCESSING AUTOMATED MARKET MAKER (AMM) PROTOCOL.</p>
                            <p className="mt-2">PRICE IS DETERMINED ALGORITHMICALLY BY SUPPLY. NO INTERMEDIARIES.</p>
                        </div>

                    </div>
                </main>
            </div>
        </DomainGate>
    );
}
