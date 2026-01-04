"use client";

import Navigation from "@/components/Navigation";
import { Scroll, Zap, Wind, Shield, ArrowRight, Hourglass } from "lucide-react";
import Link from "next/link";
import { motion } from "framer-motion";

export default function GuidePage() {
    return (
        <div className="min-h-screen bg-black text-white selection:bg-orange-500/30 font-sans pb-32">
            <Navigation />

            <main className="max-w-4xl mx-auto px-6 mt-24">

                {/* HEADLINE */}
                <header className="mb-24 text-center">
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.8 }}
                    >
                        <div className="flex items-center justify-center gap-2 mb-4 text-orange-500 font-mono text-xs uppercase tracking-[0.3em]">
                            <Scroll size={14} />
                            <span>System Philosophy</span>
                        </div>
                        <h1 className="text-6xl md:text-8xl font-black text-white uppercase tracking-tighter mb-8 leading-none">
                            The <span className="text-transparent bg-clip-text bg-gradient-to-r from-orange-500 to-red-600">Rehearsal</span>
                        </h1>
                        <p className="text-xl md:text-2xl text-gray-400 font-light max-w-2xl mx-auto leading-relaxed border-l-2 border-orange-500/30 pl-6 italic">
                            "We are not simulating reality. We are rehearsing a better one."
                        </p>
                    </motion.div>
                </header>

                {/* MANIFESTO GRID */}
                <div className="space-y-24">

                    {/* PRINCIPLE 1: THE INSTRUMENT */}
                    <section className="group">
                        <div className="flex flex-col md:flex-row gap-8 items-start">
                            <div className="w-16 h-16 rounded-full bg-white/5 border border-white/10 flex items-center justify-center shrink-0 group-hover:bg-white/10 transition-colors">
                                <Zap className="text-white w-6 h-6" />
                            </div>
                            <div>
                                <h2 className="text-4xl font-bold uppercase mb-4 tracking-tight">I. The Instrument</h2>
                                <div className="prose prose-invert prose-lg text-gray-400">
                                    <p>
                                        In the Rehearsal, tokens are not currency. They are <span className="text-white font-bold">instruments</span>.
                                        We do not chase profit; we maintain rhythm.
                                    </p>
                                    <p>
                                        <b className="text-orange-400">$GRIT</b> is the bassline—the heavy, stabilizing force of equity.
                                        <br />
                                        <b className="text-blue-400">$MOXY</b> is the melody—the voice of governance and choice.
                                        <br />
                                        <b className="text-green-400">$CHI</b> is the tempo—the liquid energy of exchange.
                                    </p>
                                    <p className="border-l border-white/20 pl-4 mt-4 italic text-sm">
                                        "To hold the token is to hold the note. Do not rush the silence."
                                    </p>
                                </div>
                            </div>
                        </div>
                    </section>

                    {/* PRINCIPLE 2: THE BREATH */}
                    <section className="group">
                        <div className="flex flex-col md:flex-row gap-8 items-start">
                            <div className="w-16 h-16 rounded-full bg-white/5 border border-white/10 flex items-center justify-center shrink-0 group-hover:bg-white/10 transition-colors">
                                <Wind className="text-white w-6 h-6" />
                            </div>
                            <div>
                                <h2 className="text-4xl font-bold uppercase mb-4 tracking-tight">II. The Breath</h2>
                                <div className="prose prose-invert prose-lg text-gray-400">
                                    <p>
                                        Value must flow like breath. To enters is to <span className="text-white font-bold">Inhale</span> (Deposit).
                                        To leave is to <span className="text-white font-bold">Exhale</span> (Withdraw).
                                    </p>
                                    <p>
                                        Panic is hyperventilation. Greed is holding one's breath until death.
                                        The system enforces a natural rhythm. You cannot exhale if you have not first let the oxygen settle.
                                    </p>
                                </div>
                            </div>
                        </div>
                    </section>

                    {/* PRINCIPLE 3: THE SCAR */}
                    <section className="group">
                        <div className="flex flex-col md:flex-row gap-8 items-start">
                            <div className="w-16 h-16 rounded-full bg-white/5 border border-white/10 flex items-center justify-center shrink-0 group-hover:bg-white/10 transition-colors">
                                <Shield className="text-white w-6 h-6" />
                            </div>
                            <div>
                                <h2 className="text-4xl font-bold uppercase mb-4 tracking-tight">III. The Scar</h2>
                                <div className="prose prose-invert prose-lg text-gray-400">
                                    <p>
                                        Trust is not given; it is etched. A <span className="text-white font-bold">Scar</span> is proof of skin in the game.
                                        Burning tokens in the Pyre creates a permanent record of your commitment.
                                    </p>
                                    <p>
                                        Only those with Scars may leave the Rehearsal. The tourists fade; the scarred remain.
                                    </p>
                                </div>
                            </div>
                        </div>
                    </section>

                    {/* PRINCIPLE 4: TIME */}
                    <section className="group">
                        <div className="flex flex-col md:flex-row gap-8 items-start">
                            <div className="w-16 h-16 rounded-full bg-white/5 border border-white/10 flex items-center justify-center shrink-0 group-hover:bg-white/10 transition-colors">
                                <Hourglass className="text-white w-6 h-6" />
                            </div>
                            <div>
                                <h2 className="text-4xl font-bold uppercase mb-4 tracking-tight">IV. The Clock</h2>
                                <div className="prose prose-invert prose-lg text-gray-400">
                                    <p>
                                        There is no "fast" money here. There is only steady accumulation.
                                        The Rehearsal operates on <span className="text-white font-bold">Epochs</span>, not seconds.
                                    </p>
                                    <p>
                                        Patience is the only arbitrage execution strategy we respect.
                                    </p>
                                </div>
                            </div>
                        </div>
                    </section>

                </div>

                {/* FOOTER ACTION */}
                <div className="mt-32 p-12 rounded-3xl border border-white/5 bg-gradient-to-br from-white/5 to-transparent text-center relative overflow-hidden group">
                    <div className="absolute inset-0 bg-orange-500/10 opacity-0 group-hover:opacity-100 transition-opacity duration-700 blur-3xl pointer-events-none" />

                    <h3 className="text-2xl font-bold mb-6 text-white relative z-10">Ready to take the stage?</h3>
                    <div className="flex justify-center gap-4 relative z-10">
                        <Link
                            href="/domain/sovereign"
                            className="px-8 py-4 bg-white text-black font-bold uppercase tracking-widest rounded-full hover:bg-orange-400 transition-colors flex items-center gap-2"
                        >
                            Enter Command <ArrowRight size={18} />
                        </Link>
                    </div>
                </div>

            </main>
        </div>
    );
}
