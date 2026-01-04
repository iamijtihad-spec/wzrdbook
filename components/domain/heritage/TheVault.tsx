"use client";

import { useState, useMemo } from "react";
import { useConnection, useAnchorWallet } from "@solana/wallet-adapter-react";
import { useGritState } from "@/components/GritStateProvider";
import TheExhale from "@/components/rituals/TheExhale";
import TheInfusion from "@/components/rituals/TheInfusion";
import { getStakingProgram } from "@/lib/solana-client";
import { AnchorProvider, BN } from "@coral-xyz/anchor";
import * as web3 from "@solana/web3.js";
import { motion } from "framer-motion";
import { Gem, Clock, ArrowUpRight, Lock, Unlock, Wind, Droplets } from "lucide-react";
import { getAssociatedTokenAddress, createAssociatedTokenAccountInstruction } from "@solana/spl-token";
import { TOKEN_MINTS, TREASURY_VAULT } from "@/constants/tokens";
import { VoiceTerminal } from "@/components/governance/VoiceTerminal";
import { Mic2 } from "lucide-react";
import { SYSTEM_DOCTRINE } from "@/lib/constants/doctrine";

// Nachhall: Stake
//
// Value bound here cannot move freely.
// Authority requires stillness.
// Duration matters more than amount.

export default function TheVault() {
    const { connection } = useConnection();
    const wallet = useAnchorWallet();
    const { gritBalance, stakedAmount, stakeStartTime, refreshBalances, stakeMoxy, unstakeMoxy, claimHeritageRewards, efficiencyMultiplier, fiatBalance } = useGritState();

    const [amount, setAmount] = useState<number>(0);
    const [isStaking, setIsStaking] = useState(false);
    const [mode, setMode] = useState<"deposit" | "withdraw" | "release" | "voice" | "infuse">("deposit");

    const timeMultiplier = useMemo(() => {
        if (!stakeStartTime) return 1.0;
        const now = Date.now();
        const daysStaked = (now - stakeStartTime) / (1000 * 60 * 60 * 24);
        return 1.0 + (daysStaked / 30) * 0.1;
    }, [stakeStartTime]);

    // Combined Multiplier (Time * Capital)
    const totalMultiplier = (timeMultiplier * (efficiencyMultiplier || 1.0));

    const handleDepositFiat = async () => {
        if (!wallet) return;
        const amt = prompt("Enter USD Amount to Deposit (Test Mode):", "100");
        if (!amt) return;
        await fetch("/api/bank/deposit", {
            method: "POST",
            body: JSON.stringify({ wallet: wallet.publicKey.toBase58(), amount: Number(amt) })
        });
        await refreshBalances();
    };

    const handleStake = async () => {
        if (!wallet) return;
        if (mode === "deposit" && amount <= 0) return;

        setIsStaking(true);
        try {
            if (mode === "withdraw") {
                await unstakeMoxy();
            } else {
                await stakeMoxy(amount);
            }
            setAmount(0);
        } catch (e: any) {
            console.error("Transaction failed:", e);
            const errStr = e.toString();
            if (errStr.includes("User rejected") || errStr.includes("Rejected")) {
                // Silent
            } else {
                alert(`Error: ${errStr}`);
            }
        } finally { setIsStaking(false); }
    };

    if (mode === "infuse") {
        return (
            <div className="w-full max-w-2xl mx-auto">
                <div className="flex gap-4 border-b border-[#333] pb-6 mb-6 bg-[#1a1a1a] p-1 overflow-x-auto">
                    <button onClick={() => setMode("deposit")} className="flex-1 py-3 bg-[#1a1a1a] text-[#555] hover:text-[#d4af37] font-bold uppercase tracking-widest flex items-center justify-center min-w-[100px]"><Lock className="w-4 h-4 inline mr-2" /> Vault</button>
                    <button onClick={() => setMode("voice")} className="flex-1 py-3 bg-[#1a1a1a] text-[#555] hover:text-[#d4af37] font-bold uppercase tracking-widest flex items-center justify-center min-w-[100px]"><Mic2 className="w-4 h-4 inline mr-2" /> Voice</button>
                    <button onClick={() => setMode("infuse")} className="flex-1 py-3 bg-[#d4af37] text-black font-bold uppercase tracking-widest flex items-center justify-center min-w-[100px]"><Droplets className="w-4 h-4 inline mr-2" /> Inhale</button>
                    <button onClick={() => setMode("release")} className="flex-1 py-3 bg-[#1a1a1a] text-[#555] hover:text-[#d4af37] font-bold uppercase tracking-widest flex items-center justify-center min-w-[100px]"><Wind className="w-4 h-4 inline mr-2" /> Exhale</button>
                </div>
                <TheInfusion />
            </div>
        );
    }

    if (mode === "release") {
        return (
            <div className="w-full max-w-2xl mx-auto">
                <div className="flex gap-4 border-b border-[#333] pb-6 mb-6 bg-[#1a1a1a] p-1">
                    <button onClick={() => setMode("deposit")} className="flex-1 py-3 bg-[#1a1a1a] text-[#555] hover:text-[#d4af37] font-bold uppercase tracking-widest flex items-center justify-center min-w-[100px]"><Lock className="w-4 h-4 inline mr-2" /> Vault</button>
                    <button onClick={() => setMode("voice")} className="flex-1 py-3 bg-[#1a1a1a] text-[#555] hover:text-[#d4af37] font-bold uppercase tracking-widest flex items-center justify-center min-w-[100px]"><Mic2 className="w-4 h-4 inline mr-2" /> Voice</button>
                    <button onClick={() => setMode("infuse")} className="flex-1 py-3 bg-[#1a1a1a] text-[#555] hover:text-[#d4af37] font-bold uppercase tracking-widest flex items-center justify-center min-w-[100px]"><Droplets className="w-4 h-4 inline mr-2" /> Inhale</button>
                    <button onClick={() => setMode("release")} className="flex-1 py-3 bg-[#d4af37] text-black font-bold uppercase tracking-widest flex items-center justify-center min-w-[100px]"><Wind className="w-4 h-4 inline mr-2" /> The Exhale</button>
                </div>
                <TheExhale />
            </div>
        );
    }

    if (mode === "voice") {
        return (
            <div className="w-full max-w-2xl mx-auto">
                <div className="flex gap-4 border-b border-[#333] pb-6 mb-6 bg-[#1a1a1a] p-1">
                    <button onClick={() => setMode("deposit")} className="flex-1 py-3 bg-[#1a1a1a] text-[#555] hover:text-[#d4af37] font-bold uppercase tracking-widest flex items-center justify-center min-w-[100px]"><Lock className="w-4 h-4 inline mr-2" /> Vault</button>
                    <button onClick={() => setMode("voice")} className="flex-1 py-3 bg-[#d4af37] text-black font-bold uppercase tracking-widest flex items-center justify-center min-w-[100px]"><Mic2 className="w-4 h-4 inline mr-2" /> Voice</button>
                    <button onClick={() => setMode("infuse")} className="flex-1 py-3 bg-[#1a1a1a] text-[#555] hover:text-[#d4af37] font-bold uppercase tracking-widest flex items-center justify-center min-w-[100px]"><Droplets className="w-4 h-4 inline mr-2" /> Inhale</button>
                    <button onClick={() => setMode("release")} className="flex-1 py-3 bg-[#1a1a1a] text-[#555] hover:text-[#d4af37] font-bold uppercase tracking-widest flex items-center justify-center min-w-[100px]"><Wind className="w-4 h-4 inline mr-2" /> Release</button>
                </div>
                <VoiceTerminal />
            </div>
        );
    }

    return (
        <div className="w-full max-w-2xl mx-auto p-1 bg-[#1a1a1a] border border-[#d4af37]/30">
            <div className="bg-[#0f0f0f] p-8 relative overflow-hidden">
                <div className="absolute top-0 right-0 w-64 h-64 bg-[#d4af37] opacity-5 blur-[100px] pointer-events-none" />
                <div className="flex justify-between items-start mb-8 relative z-10">
                    <div>
                        <h2 className="text-3xl font-bold text-[#d4af37] font-serif tracking-tight flex items-center gap-2"><Gem className="w-8 h-8" /> THE VAULT</h2>
                        <p className="text-[#888] text-sm uppercase tracking-widest mt-1">Heritage Archive // Sector 03</p>
                    </div>
                    <div className="text-right">
                        <div className="text-4xl font-bold text-white font-mono">{stakedAmount.toLocaleString()} <span className="text-xs text-[#555] align-top">GRIT</span></div>
                        <div className="text-[#d4af37] text-xs font-mono mt-1 flex items-center justify-end gap-1">
                            {stakeStartTime ? <><Clock className="w-3 h-3" /><span>{((Date.now() - stakeStartTime) / (1000 * 60 * 60 * 24)).toFixed(2)} DAYS</span></> : "NO ACTIVE STAKE"}
                        </div>
                    </div>
                </div>

                <div className="mb-8 bg-[#1a1a1a] border border-[#333] p-4 grid grid-cols-2 md:grid-cols-4 gap-4 items-center">
                    <div>
                        <div className="text-[#555] text-[10px] uppercase tracking-widest">Time Bonus</div>
                        <div className="text-lg text-white font-mono">{timeMultiplier.toFixed(2)}x</div>
                    </div>
                    <div>
                        <div className="text-[#555] text-[10px] uppercase tracking-widest">Capital Bonus</div>
                        <div className="text-lg text-green-400 font-mono">
                            {(efficiencyMultiplier || 1).toFixed(2)}x
                            <button onClick={handleDepositFiat} className="ml-2 text-[10px] bg-green-900/30 text-green-400 px-1 rounded hover:bg-green-400 hover:text-black transition-colors">+</button>
                        </div>
                    </div>

                    <div>
                        <div className="text-[#555] text-[10px] uppercase tracking-widest text-right">Total Yield</div>
                        <div className="text-xl text-[#d4af37] font-mono text-right">{totalMultiplier.toFixed(3)}x</div>
                    </div>

                    {stakedAmount > 0 && (
                        <button
                            onClick={claimHeritageRewards}
                            className="px-4 py-2 bg-[#d4af37]/10 border border-[#d4af37] text-[#d4af37] text-xs font-bold hover:bg-[#d4af37] hover:text-black transition-colors flex flex-col items-center justify-center h-full"
                        >
                            <span>CLAIM</span>
                            <span className="text-[10px] opacity-70">~{(100 * totalMultiplier).toFixed(2)} GRIT</span>
                        </button>
                    )}
                </div>

                <div className="space-y-6">
                    <div className="flex gap-4 border-b border-[#333] pb-6">
                        <button onClick={() => setMode("deposit")} className={`flex-1 py-3 font-bold uppercase tracking-widest transition-colors min-w-[100px] ${mode === "deposit" ? "bg-[#d4af37] text-black" : "bg-[#1a1a1a] text-[#555] hover:text-[#d4af37]"}`}><Lock className="w-4 h-4 inline mr-2" /> {SYSTEM_DOCTRINE.nachhall.stake}</button>
                        <button onClick={() => setMode("withdraw")} className={`flex-1 py-3 font-bold uppercase tracking-widest transition-colors min-w-[100px] ${mode === "withdraw" ? "bg-[#d4af37] text-black" : "bg-[#1a1a1a] text-[#555] hover:text-[#d4af37]"}`}><Unlock className="w-4 h-4 inline mr-2" /> Release</button>
                        <button onClick={() => setMode("voice")} className="flex-1 py-3 font-bold uppercase tracking-widest transition-colors bg-[#1a1a1a] text-[#555] hover:text-[#d4af37] min-w-[100px]"><Mic2 className="w-4 h-4 inline mr-2" /> {SYSTEM_DOCTRINE.nachhall.vote}</button>
                        <button onClick={() => setMode("infuse")} className="flex-1 py-3 font-bold uppercase tracking-widest transition-colors bg-[#1a1a1a] text-[#555] hover:text-[#d4af37] min-w-[100px]"><Droplets className="w-4 h-4 inline mr-2" /> Inhale</button>
                        <button onClick={() => setMode("release")} className="flex-1 py-3 font-bold uppercase tracking-widest transition-colors bg-[#1a1a1a] text-[#555] hover:text-[#d4af37] min-w-[100px]"><Wind className="w-4 h-4 inline mr-2" /> Exhale</button>
                    </div>

                    <div>
                        <div className="flex justify-between text-xs text-[#555] mb-2 uppercase tracking-widest"><span>Amount</span><span>Available: {(mode === "deposit" ? gritBalance : stakedAmount).toLocaleString()}</span></div>
                        <div className="relative">
                            <input type="number" value={amount} onChange={(e) => setAmount(Number(e.target.value))} className="w-full bg-[#111] border border-[#333] p-4 text-white font-mono text-xl focus:outline-none focus:border-[#d4af37] transition-colors" placeholder="0.00" />
                            <button onClick={() => setAmount(mode === "deposit" ? gritBalance : stakedAmount)} className="absolute right-4 top-1/2 -translate-y-1/2 text-[#d4af37] text-xs font-bold hover:text-white">MAX</button>
                        </div>
                    </div>

                    <button onClick={handleStake} disabled={isStaking || amount <= 0} className="w-full py-5 bg-[#1a1a1a] border border-[#d4af37] text-[#d4af37] font-bold uppercase tracking-[0.2em] hover:bg-[#d4af37] hover:text-black transition-all group relative overflow-hidden">
                        {isStaking ? "PROCESSING..." : (mode === "deposit" ? SYSTEM_DOCTRINE.nachhall.stake : SYSTEM_DOCTRINE.nachhall.cooldown)}
                        <div className="absolute inset-0 bg-white/20 translate-x-[-100%] group-hover:translate-x-[100%] transition-transform duration-700" />
                    </button>
                </div>
                {mode === "withdraw" && <div className="mt-4 text-center text-xs text-red-500 font-mono">{SYSTEM_DOCTRINE.nachhall.cooldown}</div>}
            </div>

            {/* Private Text - Visible Only in Nachhall (Staked) */}
            {stakedAmount > 0 && (
                <div className="mt-12 p-8 border border-[#d4af37]/10 bg-black/40 text-center font-serif italic text-[#666] text-sm tracking-wide leading-relaxed select-none">
                    <p className="mb-4">You have crossed beyond acquisition.</p>
                    <p className="mb-4">Nothing here will accelerate you.</p>
                    <p className="mb-4">What you bind now will outlast your attention.</p>
                    <p>You are no longer measured by activity,<br />but by what you are willing to hold still.</p>
                </div>
            )}
        </div>
    );
}
