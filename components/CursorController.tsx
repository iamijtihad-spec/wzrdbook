"use client";

import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";
import { motion, useMotionValue, useSpring } from "framer-motion";

import { useGritState } from "./GritStateProvider";

export function CursorController() {
    const pathname = usePathname();
    const { scars } = useGritState(); // Access Scars
    const [cursorVariant, setCursorVariant] = useState<"default" | "sovereign" | "ascesis" | "heritage" | "market">("default");

    // Evolution Stage Logic
    // 0 = Mortal, 1 = Scared (Survivor), 3 = Ascended (God)
    const scarCount = scars ? scars.length : 0;
    const evolutionStage = scarCount >= 3 ? 2 : (scarCount >= 1 ? 1 : 0);

    // Mouse Position
    const mouseX = useMotionValue(0);
    const mouseY = useMotionValue(0);

    const springConfig = { damping: 25, stiffness: 700 };
    const cursorX = useSpring(mouseX, springConfig);
    const cursorY = useSpring(mouseY, springConfig);

    useEffect(() => {
        if (!pathname) return;
        if (pathname.includes("sovereign")) setCursorVariant("sovereign");
        else if (pathname.includes("ascesis")) setCursorVariant("ascesis");
        else if (pathname.includes("heritage")) setCursorVariant("heritage");
        else if (pathname.includes("market")) setCursorVariant("market");
        else setCursorVariant("default");
    }, [pathname]);

    useEffect(() => {
        const moveCursor = (e: MouseEvent) => {
            mouseX.set(e.clientX - 16);
            mouseY.set(e.clientY - 16);
        };
        window.addEventListener("mousemove", moveCursor);
        return () => window.removeEventListener("mousemove", moveCursor);
    }, [mouseX, mouseY]);

    // Don't render on mobile to save perf
    const [isMobile, setIsMobile] = useState(false);
    useEffect(() => {
        if (window.innerWidth < 768) setIsMobile(true);
    }, []);

    if (isMobile) return null;

    return (
        <motion.div
            className="fixed top-0 left-0 w-8 h-8 pointer-events-none z-[9999] mix-blend-difference"
            style={{ x: cursorX, y: cursorY }}
        >
            <CursorIcon variant={cursorVariant} stage={evolutionStage} />
        </motion.div>
    );
}

function CursorIcon({ variant, stage }: { variant: string, stage: number }) {
    // Stage Effects
    // Stage 1: Survivor (Glitch/Rough)
    // Stage 2: Ascended (Radiant/Holy)

    const Wrapper = ({ children }: { children: React.ReactNode }) => (
        <div className="relative w-full h-full">
            {children}

            {/* Stage 1: Scars (Static/Glitch Overlay) */}
            {stage >= 1 && (
                <div className="absolute -inset-2 border border-white/20 rounded-full animate-pulse opacity-50"
                    style={{ clipPath: "polygon(0 0, 100% 0, 100% 30%, 0 30%)" }} />
            )}

            {/* Stage 2: Ascension (Holy Glow) */}
            {stage >= 2 && (
                <div className="absolute -inset-4 bg-white/10 rounded-full blur-xl animate-pulse" />
            )}
        </div>
    );

    switch (variant) {
        case "sovereign": // Target / Crosshair
            return (
                <Wrapper>
                    <div className="relative w-full h-full">
                        <div className={`absolute top-1/2 left-0 w-full h-[1px] bg-green-500 ${stage >= 2 ? "shadow-[0_0_10px_#0f0]" : ""}`} />
                        <div className={`absolute left-1/2 top-0 w-[1px] h-full bg-green-500 ${stage >= 2 ? "shadow-[0_0_10px_#0f0]" : ""}`} />
                        <div className="absolute inset-0 border border-green-500 rounded-full opacity-50 animate-ping" />
                    </div>
                </Wrapper>
            );
        case "ascesis": // Flame / Ember
            return (
                <Wrapper>
                    <div className={`w-4 h-4 rounded-full bg-orange-500 shadow-[0_0_20px_orange] blur-[2px] animate-pulse ${stage >= 1 ? "scale-125" : ""}`} />
                </Wrapper>
            );
        case "heritage": // Quill / Gold
            return (
                <Wrapper>
                    <div className={`w-3 h-3 rotate-45 border-2 border-[#d4af37] bg-transparent ${stage >= 2 ? "bg-[#d4af37]/50" : ""}`} />
                </Wrapper>
            );
        case "market": // Diamond / Ticker (Red)
            return (
                <Wrapper>
                    <div className="w-0 h-0 border-l-[6px] border-l-transparent border-r-[6px] border-r-transparent border-b-[10px] border-b-red-500" />
                </Wrapper>
            );
        default: // Default Dot
            return (
                <Wrapper>
                    <div className={`w-4 h-4 rounded-full bg-white opacity-50 ${stage >= 2 ? "shadow-[0_0_15px_white]" : ""}`} />
                </Wrapper>
            );
    }
}
