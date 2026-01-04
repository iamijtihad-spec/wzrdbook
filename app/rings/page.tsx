"use client";

import Navigation from "@/components/Navigation";
import Link from "next/link";
import { motion } from "framer-motion"; // Assuming framer-motion is available, if not use standard css
import ringsConfig from "@/config/rings.json";
import { Lock, Unlock } from "lucide-react";
import { useGritState } from "@/components/GritStateProvider";

export default function RingsOverview() {
    const { moxyBalance, chiBalance, gritBalance, stakingTier } = useGritState();

    // Helper to check access (frontend check for visuals, real check on page)
    const canAccess = (ring: any) => {
        if (ring.tokenGate === "none") return true;
        if (ring.tokenGate === "CHI" && chiBalance > 0) return true;
        if (ring.tokenGate === "GRIT" && gritBalance > 0) return true;
        if (ring.tokenGate === "MOXY" && moxyBalance > 0) return true;
        // Role checks
        if (ring.roleGate === "Silver" && ["Silver", "Gold", "Platinum", "Diamond"].includes(stakingTier)) return true;
        if (ring.roleGate === "Gold" && ["Gold", "Platinum", "Diamond"].includes(stakingTier)) return true;
        return false;
    };

    return (
        <div className="min-h-screen bg-black text-white selection:bg-amber-500/30 overflow-hidden relative">
            <Navigation />

            {/* Background Atmosphere */}
            <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,_var(--tw-gradient-stops))] from-amber-900/20 via-black to-black z-0" />

            <main className="relative z-10 max-w-7xl mx-auto p-4 py-20 flex flex-col items-center">
                <header className="text-center mb-24 relative">
                    <h1 className="text-6xl md:text-8xl font-black italic text-transparent bg-clip-text bg-gradient-to-b from-amber-100 to-amber-900 font-serif tracking-widest drop-shadow-2xl">
                        THE SEVEN RINGS
                    </h1>
                    <p className="text-amber-500 font-mono tracking-[0.5em] uppercase text-sm mt-4">
                        Choose Your Frequency
                    </p>
                </header>

                <div className="relative w-full max-w-4xl h-[600px] flex items-center justify-center">
                    {/* Saturn Center */}
                    <Link href="/universe" className="absolute z-50 group">
                        <div className="w-32 h-32 md:w-48 md:h-48 rounded-full bg-gradient-to-br from-amber-200 to-amber-800 shadow-[0_0_100px_rgba(245,158,11,0.5)] flex items-center justify-center relative overflow-hidden transition-transform group-hover:scale-110 duration-700">
                            <div className="absolute inset-0 bg-[url('/discord-assets/server-icon-saturn.png')] bg-cover opacity-50 mix-blend-overlay" />
                            <span className="text-amber-100 font-black tracking-widest text-xl relative z-10">CORE</span>
                        </div>
                    </Link>

                    {/* The Rings Visualization */}
                    {ringsConfig.rings.map((ring, index) => {
                        const radius = 180 + (index * 60); // Distance from center
                        const unlocked = canAccess(ring);

                        return (
                            <Link
                                key={ring.id}
                                href={`/rings/${ring.id}`}
                                className="absolute rounded-full border border-white/5 hover:border-amber-500/50 transition-all duration-500 group flex items-start justify-center"
                                style={{
                                    width: `${radius * 2}px`,
                                    height: `${radius * 2}px`,
                                    zIndex: 40 - index
                                }}
                            >
                                {/* Label Component on the Ring */}
                                <div className="mt-[-16px] bg-black px-3 py-1 rounded-full border border-white/10 group-hover:bg-amber-900/20 group-hover:border-amber-500/50 transition-all flex items-center gap-2">
                                    <span className={`w-2 h-2 rounded-full ${unlocked ? 'bg-green-500 shadow-[0_0_10px_#22c55e]' : 'bg-red-500'}`} />
                                    <span className="text-[10px] font-mono text-gray-400 group-hover:text-amber-100 uppercase tracking-wider">
                                        {ring.name.split(":")[0]}
                                    </span>
                                    {unlocked ? <Unlock size={8} className="text-gray-600" /> : <Lock size={8} className="text-gray-600" />}
                                </div>
                            </Link>
                        );
                    })}
                </div>
            </main>
        </div>
    );
}
