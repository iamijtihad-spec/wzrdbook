"use client";

import Navigation from "@/components/Navigation";
import { Star, Orbit, Eclipse, Zap } from "lucide-react";
import ManifoldComputer from "@/components/ManifoldComputer";

export default function UniversePage() {
    return (
        <div className="min-h-screen bg-black text-white selection:bg-purple-500/30">
            <Navigation />

            <main className="max-w-7xl mx-auto px-4 py-8 mt-12 pb-32 relative overflow-hidden">
                {/* Background Decor */}
                <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[800px] h-[800px] bg-purple-900/10 blur-[120px] rounded-full pointer-events-none -z-10" />

                {/* MANIFOLD ENGINE */}
                <div className="absolute top-0 left-0 w-full h-[600px] -z-5 opacity-40 pointer-events-none">
                    <ManifoldComputer />
                </div>

                {/* HERO */}
                <header className="text-center py-20 relative">
                    <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/5 border border-white/10 mb-6 animate-fade-in-up">
                        <span className="w-1.5 h-1.5 rounded-full bg-purple-400 animate-pulse" />
                        <span className="text-[10px] font-bold uppercase tracking-[0.2em] text-gray-400">Lore & Vision</span>
                    </div>
                    <h1 className="text-5xl md:text-8xl font-black italic bg-clip-text text-transparent bg-gradient-to-b from-white to-gray-600 uppercase tracking-tighter mb-6 relative z-10">
                        The Universe
                    </h1>
                    <p className="text-xl md:text-2xl text-gray-400 font-light max-w-3xl mx-auto leading-relaxed">
                        We are building a decentralized celestial body. A digital planet where art is the atmosphere and community is the gravity.
                    </p>
                </header>

                {/* PILLARS */}
                <section className="grid md:grid-cols-3 gap-8 py-12">
                    <div className="bg-gray-900/40 border border-white/5 p-8 rounded-3xl backdrop-blur-sm hover:bg-gray-900/60 transition-colors">
                        <Orbit className="w-10 h-10 text-purple-500 mb-6" />
                        <h3 className="text-2xl font-bold uppercase mb-4">The Orbit</h3>
                        <p className="text-gray-400 leading-relaxed">
                            Traditional platforms extract value. Saturn orbits around the creator and the collector equally. By holding GRIT, you don't just consume art; you hold a stake in the planet's rotation.
                        </p>
                    </div>
                    <div className="bg-gray-900/40 border border-white/5 p-8 rounded-3xl backdrop-blur-sm hover:bg-gray-900/60 transition-colors">
                        <Eclipse className="w-10 h-10 text-blue-500 mb-6" />
                        <h3 className="text-2xl font-bold uppercase mb-4">The Gravity</h3>
                        <p className="text-gray-400 leading-relaxed">
                            Bonding Curves provide the physics. As more people join (mass increases), the gravity (value) strengthens. Liquidity is guaranteed by math, not middlemen.
                        </p>
                    </div>
                    <div className="bg-gray-900/40 border border-white/5 p-8 rounded-3xl backdrop-blur-sm hover:bg-gray-900/60 transition-colors">
                        <Star className="w-10 h-10 text-orange-500 mb-6" />
                        <h3 className="text-2xl font-bold uppercase mb-4">The Constellation</h3>
                        <p className="text-gray-400 leading-relaxed">
                            Every user is a star. Every transaction is a connection. Together we form a constellation that maps the future of independent ownership.
                        </p>
                    </div>
                </section>

                {/* MANIFESTO */}
                <section className="py-24 text-center relative">
                    <div className="absolute inset-0 flex items-center justify-center opacity-10 pointer-events-none">
                        <h2 className="text-[20vw] font-black uppercase text-transparent bg-clip-text bg-gradient-to-b from-white to-transparent leading-none select-none">
                            GRIT
                        </h2>
                    </div>

                    <div className="relative z-10 max-w-4xl mx-auto">
                        <h2 className="text-3xl font-bold uppercase tracking-widest mb-12">The Prime Directive</h2>
                        <div className="space-y-8 text-lg text-gray-300">
                            <p>"To eliminate the distinction between Artist, Investor, and Fan."</p>
                            <p>In the Old World, you pay to listen. In Saturn, you listen to earn, own to govern, and stake to ascend.</p>
                            <p className="text-white font-bold text-2xl pt-4">Welcome to the Event Horizon.</p>
                        </div>
                    </div>
                </section>

            </main>
        </div>
    );
}
