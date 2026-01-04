"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useGritState } from "@/components/GritStateProvider"; // Assuming hook exists
import { resolveWithdrawalState, getWithdrawalCopy, WithdrawalState } from "@/config/withdrawalCopy";
import { breathVariants } from "@/lib/motion/breath.motion";
import { AlertCircle, Lock, Zap, ArrowRight, ShieldAlert } from "lucide-react";

// --- SUB-COMPONENTS ---

const StatusBanner = ({ state, mode }: { state: WithdrawalState, mode: "poetic" | "neutral" }) => {
    const copy = getWithdrawalCopy(state, mode);
    const isError = ["PAUSED", "CAP_REACHED", "RATE_LIMITED", "INSUFFICIENT_SCARS", "INSUFFICIENT_TIME", "FAILED"].includes(state);

    return (
        <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            className={`w-full p-4 rounded-xl border ${isError ? "bg-red-900/10 border-red-500/30 text-red-400" : "bg-green-900/10 border-green-500/30 text-green-400"} mb-6`}
        >
            <div className="flex items-start gap-4">
                <div className={`p-2 rounded-lg ${isError ? "bg-red-500/20" : "bg-green-500/20"}`}>
                    {isError ? <AlertCircle size={20} /> : <Zap size={20} />}
                </div>
                <div>
                    <h3 className="font-bold text-lg mb-1">{copy.title}</h3>
                    <p className="text-sm opacity-80 leading-relaxed font-mono">{copy.description}</p>
                </div>
            </div>
        </motion.div>
    );
};

const EligibilityMeter = ({ score, threshold }: { score: number, threshold: number }) => {
    // Visual gauge, non-numeric
    const percent = Math.min((score / threshold) * 100, 100);
    return (
        <div className="w-full mb-8">
            <div className="flex justify-between text-xs uppercase font-bold text-gray-500 mb-2 tracking-widest">
                <span>Readiness</span>
                <span>{percent >= 100 ? "Prime" : "Charging"}</span>
            </div>
            <div className="h-1 bg-gray-800 rounded-full overflow-hidden">
                <motion.div
                    initial={{ width: 0 }}
                    animate={{ width: `${percent}%` }}
                    transition={{ duration: 1, ease: "circOut" }}
                    className={`h-full ${percent >= 100 ? "bg-green-500 shadow-[0_0_10px_#22c55e]" : "bg-gray-600"}`}
                />
            </div>
        </div>
    );
};

const ReleaseControl = ({ onRelease, state }: { onRelease: () => void, state: WithdrawalState }) => {
    const [isHolding, setIsHolding] = useState(false);
    const isReady = state === "READY";
    const copy = getWithdrawalCopy(state, "poetic"); // Use poetic for button

    return (
        <div className="relative flex justify-center py-12">
            <div className="relative">
                {/* Breath Ring */}
                <motion.div
                    variants={breathVariants}
                    animate={isHolding ? "hold" : (isReady ? "inhale" : "idle")}
                    className={`w-32 h-32 rounded-full border-4 ${isReady ? "border-green-500/30" : "border-gray-800"}`}
                />

                {/* Interaction Button */}
                <button
                    disabled={!isReady}
                    onMouseDown={() => isReady && setIsHolding(true)}
                    onMouseUp={() => {
                        if (isReady && isHolding) {
                            setIsHolding(false);
                            onRelease();
                        }
                    }}
                    onMouseLeave={() => setIsHolding(false)}
                    className={`absolute inset-0 m-auto w-24 h-24 rounded-full flex items-center justify-center font-bold text-xs uppercase tracking-widest transition-all
                        ${isReady
                            ? "bg-green-500 text-black hover:scale-105 active:scale-95 shadow-[0_0_20px_#22c55e]"
                            : "bg-gray-800 text-gray-500 cursor-not-allowed"
                        }`}
                >
                    {isHolding ? "HOLD" : (isReady ? "RELEASE" : "LOCKED")}
                </button>
            </div>
        </div>
    );
};

const ReasonCard = ({ state }: { state: WithdrawalState }) => {
    if (state === "INSUFFICIENT_SCARS") {
        return (
            <div className="glass-panel p-4 rounded-xl border border-orange-500/30 flex justify-between items-center group cursor-pointer hover:bg-orange-500/10 transition-colors">
                <div>
                    <h4 className="font-bold text-orange-400 text-sm mb-1">Ritual Required</h4>
                    <p className="text-xs text-gray-400">You must burn tokens in The Pyre to gain Scars.</p>
                </div>
                <ArrowRight className="text-orange-500 group-hover:translate-x-1 transition-transform" />
            </div>
        );
    }
    return null;
};

// --- MAIN SCREEN ---

export default function WithdrawalScreen() {
    const { scars = [], treasuryFlags } = useGritState();
    const [tone, setTone] = useState<"poetic" | "neutral">("poetic");

    const currentState = resolveWithdrawalState({
        isPaused: treasuryFlags.paused,
        isCapReached: treasuryFlags.capReached,
        isRateLimited: treasuryFlags.rateLimited,
        hasScars: scars.length > 0,
        isTimeReady: !treasuryFlags.insufficientTime
    });

    const handleWithdraw = async () => {
        console.log("Withdrawal Initiated");
        // Call API
    };

    return (
        <div className="max-w-md mx-auto p-6 glass-panel rounded-3xl border border-white/5 bg-black/60 backdrop-blur-xl relative overflow-hidden">
            {/* Tone Toggle (Regulator Safe) */}
            <div className="absolute top-4 right-4 z-10">
                <button
                    onClick={() => setTone(t => t === "poetic" ? "neutral" : "poetic")}
                    className="text-[10px] uppercase font-bold text-gray-600 hover:text-white transition-colors"
                >
                    {tone} Mode
                </button>
            </div>

            <div className="text-center mb-8 pt-4">
                <h2 className="text-2xl font-black uppercase text-white mb-1 tracking-tighter">Withdrawal</h2>
                <p className="text-xs text-gray-500 font-mono">Treasury Interface v1.0</p>
            </div>

            <StatusBanner state={currentState} mode={tone} />
            <EligibilityMeter score={Array.isArray(scars) ? scars.length : (scars || 0)} threshold={1} />
            <ReleaseControl onRelease={handleWithdraw} state={currentState} />

            <ReasonCard state={currentState} />

            <div className="text-center mt-8 text-[10px] text-gray-700 font-mono">
                <div className="flex justify-center items-center gap-2 mb-1">
                    <ShieldAlert size={12} />
                    <span>SECURE ENCLAVE</span>
                </div>
                Protected by Treasury Guardrails
            </div>
        </div>
    );
}
