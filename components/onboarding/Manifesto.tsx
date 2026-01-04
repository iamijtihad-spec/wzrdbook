"use client";

import { motion } from 'framer-motion';

export const Manifesto = ({ onAccept }: { onAccept?: () => void }) => {
    return (
        <div className="max-w-3xl mx-auto py-20 px-10 font-serif leading-relaxed text-white/70 bg-black border border-white/10 shadow-2xl relative overflow-hidden">
            <div className="absolute inset-0 bg-[url('/noise.png')] opacity-10 pointer-events-none mix-blend-overlay" />

            <motion.h1
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 1 }}
                className="text-5xl md:text-6xl font-light tracking-tighter text-white mb-16 relative z-10"
            >
                The Belief <br />
                <span className="text-white/30 italic">Operating System</span>
            </motion.h1>

            <section className="space-y-12 relative z-10">
                <motion.div
                    initial={{ opacity: 0 }}
                    whileInView={{ opacity: 1 }}
                    transition={{ delay: 0.2 }}
                >
                    <h3 className="text-xs font-mono uppercase tracking-widest text-[#d4af37] mb-2">I. The Myth of the Dashboard</h3>
                    <p>The modern world treats value as a dashboard—a series of numbers to be managed, optimized, and extracted. This is the death of art. Art is not a resource; it is a Resonance. To treat an artist’s sound as a mere "asset" is to breathe without ever exhaling.</p>
                </motion.div>

                <motion.div
                    initial={{ opacity: 0 }}
                    whileInView={{ opacity: 1 }}
                    transition={{ delay: 0.4 }}
                >
                    <h3 className="text-xs font-mono uppercase tracking-widest text-red-500 mb-2">II. The Four Realities</h3>
                    <p className="mb-4">We believe that participation in art requires a shift in physics. One cannot hear the truth while obsessed with the price. Therefore, we have fragmented the world into four domains:</p>
                    <ul className="list-none space-y-4 pl-4 border-l border-white/10 text-sm">
                        <li><span className="text-cyan-400 font-bold">SOVEREIGN (The Root):</span> Where the breath is loaded. Here, agency is liquid. Participation is the baseline.</li>
                        <li><span className="text-[#d4af37] font-bold">HERITAGE (The Archive):</span> Where time is the only currency. You do not buy your way into the Archive; you wait your way in.</li>
                        <li><span className="text-red-500 font-bold">ASCESIS (The Trial):</span> Where capacity is earned through permanent loss. To hold more, you must own less.</li>
                        <li><span className="text-green-500 font-bold">GLITCH (The Performance):</span> Where chaos reveals the system’s limits. We do not hide the volatility; we perform it.</li>
                    </ul>
                </motion.div>

                <motion.div
                    initial={{ opacity: 0 }}
                    whileInView={{ opacity: 1 }}
                    transition={{ delay: 0.6 }}
                >
                    <h3 className="text-xs font-mono uppercase tracking-widest text-white/50 mb-2">III. The Echo over the Asset</h3>
                    <p>We do not reward you with badges or points. We reward you with Echoes—generative fragments of the artist’s DNA that react to your history. Your Archive Gallery is not a wallet; it is a record of your presence.</p>
                </motion.div>
            </section>

            <div className="mt-20 border-t border-white/10 pt-10 text-center relative z-10">
                <button
                    onClick={onAccept}
                    className="group relative px-8 py-3 overflow-hidden rounded-none bg-transparent hover:bg-white/5 transition-colors"
                >
                    <span className="text-[10px] tracking-[0.6em] uppercase text-white/50 group-hover:text-white transition-colors">
                        Accept the Physics
                    </span>
                    <div className="absolute bottom-0 left-0 w-full h-[1px] bg-gradient-to-r from-transparent via-white/50 to-transparent transform scale-x-0 group-hover:scale-x-100 transition-transform duration-500" />
                </button>
            </div>
        </div>
    );
};
