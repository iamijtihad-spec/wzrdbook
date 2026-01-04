"use client";

import { motion } from "framer-motion";

interface EchoAttributes {
    domain: "SOVEREIGN" | "ASCESIS" | "HERITAGE" | "GLITCH";
    resonance: number;
    fracture_intensity?: number;
    luster?: number;
    rarity: "common" | "uncommon" | "rare" | "artifact";
}

export const EchoArtifact = ({ attributes }: { attributes: EchoAttributes }) => {
    // Visual mappings based on domain
    const getGradient = () => {
        switch (attributes.domain) {
            case "ASCESIS": return "from-red-900 via-black to-red-900/20";
            case "HERITAGE": return "from-amber-900 via-black to-amber-900/20";
            case "SOVEREIGN": return "from-cyan-900 via-black to-cyan-900/20";
            case "GLITCH": return "from-green-900 via-black to-green-900/20";
        }
    };

    const getParticleColor = () => {
        switch (attributes.domain) {
            case "ASCESIS": return "bg-red-500";
            case "HERITAGE": return "bg-amber-400";
            case "SOVEREIGN": return "bg-cyan-400";
            case "GLITCH": return "bg-green-500";
        }
    };

    return (
        <div className={`relative w-full h-full bg-gradient-to-br ${getGradient()}`}>
            {/* Core Geometry - Generative Placeholder */}
            <div className="absolute inset-0 flex items-center justify-center">
                <motion.div
                    animate={{
                        rotate: [0, 360],
                        scale: [0.8, 1.2, 0.8],
                    }}
                    transition={{
                        duration: 20 - (attributes.resonance * 0.1), // Resonance speeds it up
                        repeat: Infinity,
                        ease: "linear"
                    }}
                    className={`w-64 h-64 border border-white/10 rounded-full blur-[100px] opacity-40 mix-blend-screen`}
                    style={{ backgroundColor: attributes.domain === 'ASCESIS' ? 'red' : attributes.domain === 'HERITAGE' ? 'gold' : 'cyan' }}
                />
            </div>

            {/* Fractures (Ascesis) */}
            {attributes.fracture_intensity && attributes.fracture_intensity > 0 && (
                <div className="absolute inset-0 pointer-events-none">
                    <div className="w-full h-full bg-[url('/noise.png')] mix-blend-overlay opacity-30" />
                    {Array.from({ length: Math.floor(attributes.fracture_intensity * 5) }).map((_, i) => (
                        <div
                            key={i}
                            className="absolute bg-white/40 shadow-[0_0_10px_white]"
                            style={{
                                top: `${Math.random() * 100}%`,
                                left: `${Math.random() * 100}%`,
                                width: `${Math.random() * 100}px`,
                                height: '1px',
                                transform: `rotate(${Math.random() * 360}deg)`
                            }}
                        />
                    ))}
                </div>
            )}

            {/* Luster (Heritage) */}
            {attributes.luster && attributes.luster > 0 && (
                <div className="absolute inset-0 pointer-events-none overflow-hidden">
                    {Array.from({ length: 20 }).map((_, i) => (
                        <motion.div
                            key={i}
                            className={`absolute w-1 h-1 rounded-full ${getParticleColor()}`}
                            initial={{ y: "100%", x: Math.random() * 1000, opacity: 0 }}
                            animate={{
                                y: "-100%",
                                opacity: [0, 1, 0],
                            }}
                            transition={{
                                duration: 5 + Math.random() * 5,
                                repeat: Infinity,
                                delay: Math.random() * 5,
                                ease: "linear"
                            }}
                        />
                    ))}
                </div>
            )}

            {/* Glitch Overlay */}
            {attributes.domain === "GLITCH" && (
                <div className="absolute inset-0 bg-[url('/scanlines.png')] opacity-20 pointer-events-none mix-blend-overlay animate-pulse" />
            )}

            {/* Rarity Border */}
            <div className={`absolute inset-4 border ${attributes.rarity === 'artifact' ? 'border-dashed' : 'border-dotted'} border-white/10 rounded-lg`} />
        </div>
    );
};
