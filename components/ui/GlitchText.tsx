"use client";
import React from 'react';
import { motion } from 'framer-motion';

interface GlitchTextProps {
    text: string;
    className?: string;
    size?: "sm" | "md" | "lg" | "xl" | "2xl";
}

const GlitchText: React.FC<GlitchTextProps> = ({ text, className = "", size = "md" }) => {
    const sizeClasses = {
        sm: "text-xl",
        md: "text-4xl",
        lg: "text-6xl",
        xl: "text-8xl",
        "2xl": "text-9xl"
    };

    return (
        <div className={`relative inline-block group`}>
            <span className={`relative z-10 block ${sizeClasses[size]} font-black tracking-tighter ${className} mix-blend-difference`}>
                {text}
            </span>
            <span className={`absolute top-0 left-0 -z-10 block ${sizeClasses[size]} font-black tracking-tighter text-red-500 opacity-0 group-hover:opacity-70 group-hover:translate-x-[2px] transition-all duration-100 ease-linear animate-pulse`}>
                {text}
            </span>
            <span className={`absolute top-0 left-0 -z-10 block ${sizeClasses[size]} font-black tracking-tighter text-cyan-500 opacity-0 group-hover:opacity-70 group-hover:-translate-x-[2px] transition-all duration-100 ease-linear delay-75 animate-pulse`}>
                {text}
            </span>
        </div>
    );
};

export default GlitchText;
