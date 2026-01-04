
"use client";

import { useRef, useEffect } from "react";
import { useGesture } from "@use-gesture/react";
import { useDomain } from "@/components/providers/DomainProvider"; // Adjust path if needed
import { motion, useSpring, useMotionValue, useTransform } from "framer-motion";

export const MobileRitualController = () => {
    const { setDomain, domain } = useDomain();
    const bgRef = useRef<HTMLDivElement>(null);

    // Haptic Trigger Helper
    const vibrate = (pattern: number[]) => {
        if (typeof window !== 'undefined' && window.navigator?.vibrate) {
            window.navigator.vibrate(pattern);
        }
    };

    const bind = useGesture({
        onDrag: ({ offset: [x, y], down, movement: [mx, my] }) => {
            // Visual feedback could be wired here to spring values
        },
        onDragEnd: ({ movement: [mx, my], velocity: [vx, vy] }) => {
            const threshold = 100;
            const velocityThreshold = 0.5;

            // Radial Logic
            // Up (Negative Y) -> Ascesis
            if (my < -threshold || (my < -50 && vy > velocityThreshold)) {
                if (domain !== 'ascesis') {
                    setDomain('ascesis');
                    vibrate([20]);
                }
            }
            // Down (Positive Y) -> Heritage
            else if (my > threshold || (my > 50 && vy > velocityThreshold)) {
                if (domain !== 'heritage') {
                    setDomain('heritage');
                    vibrate([10, 30, 10]); // Heavier feel
                }
            }
            // Left (Negative X) -> Glitch
            else if (mx < -threshold || (mx < -50 && vx > velocityThreshold)) {
                if (domain !== 'glitch') {
                    setDomain('glitch');
                    vibrate([5, 5, 5, 5, 5]); // Static buzz
                }
            }
            // Right (Positive X) -> Sovereign
            else if (mx > threshold || (mx > 50 && vx > velocityThreshold)) {
                if (domain !== 'sovereign') {
                    setDomain('sovereign');
                    vibrate([40]); // Smooth pulse
                }
            }
        }
    }, {
        drag: {
            delay: true,
            filterTaps: true,
            axis: undefined // Free movement
        }
    });

    // Only render on small screens (handled via CSS usually, or JS check)
    // For this component, we assume it's mounted in a layout that shows it primarily on mobile
    // or it acts as an invisible layer over the viewport.

    return (
        <div
            {...bind()}
            className="fixed inset-0 z-50 touch-none flex items-center justify-center pointer-events-auto md:pointer-events-none"
            style={{ touchAction: 'none' }} // Critical for preventing browser scroll interference
        >
            {/* The Central Artifact (Visual Anchor) - Only visible on mobile ideally */}
            <div className="md:hidden relative w-32 h-32 rounded-full border border-white/5 flex items-center justify-center opacity-20 pointer-events-none">
                <div className="absolute w-2 h-2 bg-white/50 rounded-full animate-ping" />

                {/* Radial Guides */}
                <div className="absolute top-4 text-[8px] uppercase tracking-widest text-red-500/50">Ascesis</div>
                <div className="absolute bottom-4 text-[8px] uppercase tracking-widest text-amber-500/50">Heritage</div>
                <div className="absolute left-2 text-[8px] uppercase tracking-widest text-purple-500/50 -rotate-90">Glitch</div>
                <div className="absolute right-2 text-[8px] uppercase tracking-widest text-cyan-500/50 rotate-90">Sov</div>
            </div>

            {/* CSS override to ensure clicks pass through if not dragging? 
                Actually @use-gesture handles this well usually, but if we cover the screen 
                we might block button clicks. 
                We might need to make this a "background" layer or ensure logic doesn't swallow clicks.
            */}
        </div>
    );
};
