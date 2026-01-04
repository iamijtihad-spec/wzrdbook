"use client";

import { useDomain, Domain } from '@/components/providers/DomainProvider';
import { motion, AnimatePresence } from 'framer-motion';
import { useEffect } from 'react';
import { GlitchTerminal } from '@/components/domain/glitch/GlitchTerminal';

export const SentientBridge = ({ children }: { children: React.ReactNode }) => {
    const { domain, setDomain } = useDomain();
    // Track mouse for the "Void Light" via CSS only (No Re-renders)
    useEffect(() => {
        const handleMouseMove = (e: MouseEvent) => {
            // Updating DOM directly to avoid React Render Cycle on every frame
            document.body.style.setProperty('--mouse-x', `${e.clientX}px`);
            document.body.style.setProperty('--mouse-y', `${e.clientY}px`);
        };

        window.addEventListener('mousemove', handleMouseMove);
        return () => window.removeEventListener('mousemove', handleMouseMove);
    }, []);

    const domains: Domain[] = ['sovereign', 'heritage', 'ascesis', 'market', 'glitch'];

    return (
        <div className="relative min-h-screen">
            {/* Visual Effects */}
            <div className="void-light" />
            <div className="void-grain" />

            {/* Glitch Overlay */}
            <AnimatePresence>
                {domain === 'glitch' && (
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className="fixed top-8 right-8 z-[200]"
                    >
                        <GlitchTerminal />
                    </motion.div>
                )}
            </AnimatePresence>

            {/* Abstract Navigation Map */}
            <nav className="fixed bottom-8 left-1/2 -translate-x-1/2 z-[100] flex gap-6 p-4 glass-panel rounded-full">
                {domains.map(d => (
                    <button
                        key={d}
                        onClick={() => setDomain(d)}
                        className="group relative flex items-center justify-center w-4 h-4"
                        aria-label={`Enter ${d}`}
                    >
                        <motion.div
                            className={`w-2 h-2 rounded-full transition-all duration-500 ${domain === d
                                ? 'bg-[var(--domain-accent)] scale-150 shadow-[0_0_10px_var(--domain-accent)]'
                                : 'bg-white/20 group-hover:bg-white/50'
                                }`}
                            layoutId="nav-dot"
                        />
                        {/* Tooltip on hover */}
                        <span className="absolute -top-8 left-1/2 -translate-x-1/2 text-[10px] uppercase tracking-widest opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap text-[var(--domain-accent)] pointer-events-none">
                            {d}
                        </span>
                    </button>
                ))}
            </nav>

            <main className="relative z-10 transition-all duration-1000">
                {children}
            </main>
        </div>
    );
};
