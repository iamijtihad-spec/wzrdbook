"use client";

import { motion, useAnimation } from 'framer-motion';
import { useGritState } from '@/components/GritStateProvider';
import { calculateFluidDynamics } from '@/lib/motion/fluid-physics';
import { useEffect, useRef } from 'react';
import { SYSTEM_DOCTRINE } from '@/lib/constants/doctrine';

// This component expects to hook into the global audio context eventually.
// For now, it will simulate reaction if no audio source is provided, or use props.
export const FluidAudioPlayer = ({ className = "h-[60vh]" }: { className?: string }) => {
    const { gritBalance, stakedAmount } = useGritState();
    const controls = useAnimation();
    const bgControls = useAnimation();
    const animationRef = useRef<number | null>(null);

    // Mock Audio Reactivity + Gyroscope for Visuals
    useEffect(() => {
        let mounted = true;
        let animationFrameId: number;
        let lastFreq = 128;

        const update = () => {
            if (!mounted) return;

            const time = Date.now();
            // Smoother frequency simulation
            const targetFreq = Math.sin(time / 400) * 40 + 120 + (Math.random() * 30);
            lastFreq = lastFreq * 0.9 + targetFreq * 0.1;

            const mockFreq = new Uint8Array(16).fill(0).map((_, i) =>
                lastFreq + Math.sin(time / (200 + i * 10)) * 20
            );

            const dynamics = calculateFluidDynamics(gritBalance || 0, mockFreq);

            try {
                if (mounted) {
                    controls.set({
                        scale: dynamics.scale,
                        opacity: dynamics.opacity,
                        filter: `blur(${dynamics.blur}px) contrast(1.2) saturate(1.1)`,
                        rotate: dynamics.rotation + (time / 2000),
                    });

                    bgControls.set({
                        scale: dynamics.scale * 1.4,
                        opacity: dynamics.opacity * 0.4,
                        rotate: -dynamics.rotation - (time / 3000),
                        filter: `blur(${dynamics.blur * 2}px)`,
                    });
                }
            } catch (e) { }

            animationFrameId = requestAnimationFrame(update);
        };

        animationFrameId = requestAnimationFrame(update);

        return () => {
            mounted = false;
            cancelAnimationFrame(animationFrameId);
            controls.stop();
            bgControls.stop();
        };
    }, [gritBalance, controls, bgControls]);

    return (
        <div className={`relative flex items-center justify-center w-full overflow-hidden ${className}`}>
            {/* Organic Fluid Core - Layer 2 (Atmospheric) */}
            <motion.div
                animate={bgControls}
                className="absolute w-80 h-80 rounded-full mix-blend-screen opacity-20"
                style={{
                    background: 'radial-gradient(circle, var(--domain-accent) 0%, transparent 60%)',
                    filter: 'blur(60px)'
                }}
            />

            {/* Organic Fluid Core - Layer 1 (Active) */}
            <motion.div
                animate={controls}
                className="absolute w-72 h-72 rounded-full mix-blend-screen"
                style={{
                    boxShadow: '0 0 120px var(--domain-accent-muted)',
                    background: 'radial-gradient(circle, var(--domain-accent) 0%, var(--domain-accent-muted) 30%, transparent 75%)',
                }}
            >
                {/* Visual Grain/Noise over the fluid */}
                <div className="absolute inset-0 opacity-10 mix-blend-overlay bg-[url('/noise.png')] rounded-full" />
            </motion.div>

            {/* The "Void" Center - Interaction Point */}
            <motion.div
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                className="relative z-10 w-48 h-48 rounded-full bg-black/90 flex items-center justify-center border border-white/5 shadow-[inset_0_0_20px_rgba(255,255,255,0.05)] backdrop-blur-xl cursor-pointer group"
            >
                <div className="absolute inset-0 rounded-full border border-[var(--domain-accent)] opacity-20 group-hover:opacity-40 transition-opacity animate-pulse" />

                <div className="text-center">
                    <div className="text-[9px] uppercase tracking-[0.4em] text-[var(--domain-accent)] mb-2 font-mono font-black">RESONANCE</div>
                    <div className="text-4xl font-serif text-white tracking-tighter italic">
                        {((gritBalance || 0) / 10).toFixed(1)}%
                    </div>
                </div>
            </motion.div>

            {/* Tiny Monospaced Controls in the margins */}
            <div className="absolute bottom-0 left-0 p-8 font-mono text-[10px] text-[var(--domain-text-muted)] uppercase">
                Aural_Engine: {SYSTEM_DOCTRINE.global.loading} <br />
                {SYSTEM_DOCTRINE.anfang.balance}: {stakedAmount > 0 ? 'True' : 'False'}
            </div>
        </div>
    );
};
