"use client";

import { motion } from 'framer-motion';
import { useGritState } from '@/components/GritStateProvider';
import { GLITCH_THRESHOLD } from '@/lib/protocol/glitch';
import { useEffect, useState } from 'react';

export const GlitchTerminal = () => {
    const {
        gritBalance,
        solBalance,
        moxyBalance,
        chiBalance,
        stakedAmount,
        walletAddress,
        resonance,
        stakeStartTime,
        marketState,
        wzrdHandle
    } = useGritState();

    const [volatility, setVolatility] = useState(0.04);
    const [pendingRewards, setPendingRewards] = useState(0);

    // Live Drip Calculation for Staking
    useEffect(() => {
        if (!stakeStartTime || stakedAmount <= 0) {
            setPendingRewards(0);
            return;
        }

        const interval = setInterval(() => {
            const now = Date.now();
            // Mock Rate: 1 GRIT per 1000 MOXY per hour (just for visuals)
            const hoursStaked = (now - stakeStartTime) / (1000 * 60 * 60);
            const reward = (stakedAmount / 1000) * hoursStaked;
            setPendingRewards(reward);
        }, 100); // Fast update for "live" feel

        return () => clearInterval(interval);
    }, [stakeStartTime, stakedAmount]);

    // Format numbers
    const fmt = (n: number, d = 2) => n.toLocaleString(undefined, { minimumFractionDigits: d, maximumFractionDigits: d });

    return (
        <div className="p-4 font-mono text-[12px] text-[var(--domain-accent)] lowercase leading-tight border border-[var(--domain-accent)] bg-black/90">
            <div className="mb-4 border-b border-[var(--domain-accent)] pb-2 flex justify-between items-center">
                <span>[SYSTEM_STATUS]</span>
                <span className={volatility > GLITCH_THRESHOLD ? "animate-pulse text-red-500" : "text-green-500"}>
                    {walletAddress ? "ONLINE" : "OFFLINE"}
                </span>
            </div>

            <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ duration: 0.5 }}
                className="space-y-2"
            >
                {/* IDENTITY */}
                <div className="flex justify-between">
                    <span>:: ROOT_USER</span>
                    <span className="truncate max-w-[150px]">
                        {wzrdHandle ? wzrdHandle.toUpperCase() : (walletAddress ? `${walletAddress.slice(0, 4)}...${walletAddress.slice(-4)}` : "NULL")}
                    </span>
                </div>

                {/* LIQUIDITY */}
                <div className="border-t border-[var(--domain-accent)]/30 pt-2 mt-2">
                    <div className="flex justify-between">
                        <span>$SOL_NATIVE</span>
                        <span>{fmt(solBalance, 4)}</span>
                    </div>
                    <div className="flex justify-between font-bold">
                        <span>$GRIT_TOKEN</span>
                        <span>{fmt(gritBalance)}</span>
                    </div>
                </div>

                {/* ASSETS */}
                <div className="border-t border-[var(--domain-accent)]/30 pt-2 mt-2">
                    <div className="flex justify-between text-purple-400">
                        <span>$MOXY_STK</span>
                        <span>{fmt(stakedAmount)}</span>
                    </div>
                    <div className="flex justify-between text-yellow-400">
                        <span>$CHI_PWR</span>
                        <span>{fmt(chiBalance)}</span>
                    </div>
                </div>

                {/* DRIP FEEDS */}
                <div className="border-t border-[var(--domain-accent)]/30 pt-2 mt-2">
                    <div className="flex justify-between items-center group">
                        <span>++ PENDING_RWD</span>
                        <span className="animate-pulse text-green-300">
                            +{fmt(pendingRewards, 6)}
                        </span>
                    </div>
                    <div className="flex justify-between items-center">
                        <span>++ RESONANCE</span>
                        <span className="text-blue-300">
                            {fmt(resonance, 1)} Hz
                        </span>
                    </div>
                </div>

                {/* MARKET METRICS */}
                <div className="opacity-50 text-[10px] mt-4 pt-2 border-t border-dashed border-gray-700">
                    <div>&gt; SUPPLY: {fmt(marketState?.currentSupply || 0, 0)}</div>
                    <div>&gt; VOLATILITY: {(volatility * 100).toFixed(2)}%</div>
                </div>

                {volatility > GLITCH_THRESHOLD && (
                    <div className="bg-[var(--domain-accent)] text-black px-1 mt-2 inline-block font-bold">
                        WARNING: SYSTEM RUPTURE IMMINENT
                    </div>
                )}
            </motion.div>

            {/* Scrambled Text Effect */}
            <div className="mt-6 opacity-20 select-none pointer-events-none overflow-hidden h-12 text-[10px]">
                {Array.from({ length: 3 }).map((_, i) => (
                    <div key={i} className="whitespace-nowrap animate-pulse">
                        {Math.random().toString(36).substring(2)}
                        {Math.random().toString(36).substring(2)}
                    </div>
                ))}
            </div>
        </div>
    );
};
