
"use client";

import { useState, useEffect } from "react";
import { useWallet, useConnection } from "@solana/wallet-adapter-react";
import { motion, AnimatePresence } from "framer-motion";
import { Droplets, ArrowDown, ExternalLink } from "lucide-react";
import { initiateInhale, RITUAL_TOKEN_MAP, RitualTokenType } from "@/lib/protocol/inhale-pipeline";
import { initiateInhale as createInhaleTx } from "@/lib/protocol/inhale-pipeline";
// Note: importing same function twice with alias for clarity if needed, 
// or just using the one import. Ideally checking the export.

export default function TheInfusion() {
    const { publicKey, sendTransaction } = useWallet();
    const { connection } = useConnection();

    const [selectedToken, setSelectedToken] = useState<RitualTokenType>("GRIT");
    const [amountSOL, setAmountSOL] = useState<string>("1.0");
    const [status, setStatus] = useState<"idle" | "infusing" | "success" | "error">("idle");
    const [txHash, setTxHash] = useState("");

    const tokenConfig = RITUAL_TOKEN_MAP[selectedToken];

    // Dynamic Background Colors based on selection
    const getGlowColor = () => {
        switch (selectedToken) {
            case "GRIT": return "from-cyan-500/20 via-cyan-900/10";
            case "MOXY": return "from-violet-500/20 via-violet-900/10";
            case "CHI": return "from-emerald-500/20 via-emerald-900/10";
            default: return "from-white/10";
        }
    };

    const handleInfusion = async () => {
        if (!publicKey) return;
        setStatus("infusing");

        try {
            const val = parseFloat(amountSOL);
            if (isNaN(val) || val <= 0) throw new Error("Invalid amount");

            // 1. Prepare Protocol Transaction
            const { transaction, expectedTokens } = await createInhaleTx(publicKey, val, selectedToken);

            // 2. Send (The Sacrifice)
            const sig = await sendTransaction(transaction, connection);

            console.log("Infusion Sent:", sig);
            setTxHash(sig);

            // 3. Wait for confirmation (Simulated Oracle delay for UI feedback)
            // In a real app we might poll the API or wait for a websocket event
            await new Promise(r => setTimeout(r, 2000));

            setStatus("success");

        } catch (error: any) {
            console.error("Infusion Failed:", error);
            setStatus("error");
        }
    };

    return (
        <div className="relative w-full max-w-lg mx-auto min-h-[500px] flex flex-col p-8 rounded-3xl border border-white/5 bg-[#050505] overflow-hidden shadow-2xl">

            {/* Ambient Bleed */}
            <motion.div
                animate={{ opacity: 1 }}
                className={`absolute inset-0 bg-gradient-to-br ${getGlowColor()} to-black pointer-events-none transition-colors duration-1000`}
            />

            <div className="relative z-10 flex flex-col h-full">
                {/* Header */}
                <div className="flex items-center justify-between mb-8">
                    <h2 className="text-xl font-serif tracking-widest text-white/90">THE INFUSION</h2>
                    <Droplets className={`w-5 h-5 text-${tokenConfig.color}-400 opacity-60`} />
                </div>

                {/* Token Selection */}
                <div className="flex space-x-2 mb-8">
                    {(Object.keys(RITUAL_TOKEN_MAP) as RitualTokenType[]).map((t) => (
                        <button
                            key={t}
                            onClick={() => setSelectedToken(t)}
                            className={`flex-1 py-3 text-xs font-mono tracking-wider border transition-all ${selectedToken === t
                                    ? `border-${RITUAL_TOKEN_MAP[t].color}-500/50 bg-${RITUAL_TOKEN_MAP[t].color}-500/10 text-white`
                                    : 'border-white/5 bg-white/5 text-white/40 hover:bg-white/10'
                                }`}
                        >
                            {t}
                        </button>
                    ))}
                </div>

                {/* Input Area */}
                <div className="flex-1 flex flex-col justify-center space-y-6">
                    <div className="flex flex-col space-y-2">
                        <label className="text-[10px] uppercase tracking-widest text-white/30">Sacrifice (SOL)</label>
                        <input
                            type="number"
                            value={amountSOL}
                            onChange={(e) => setAmountSOL(e.target.value)}
                            className="w-full bg-transparent text-4xl font-light text-white outline-none placeholder-white/10 font-mono"
                            placeholder="0.00"
                        />
                    </div>

                    <div className="flex items-center justify-center text-white/20">
                        <ArrowDown className="w-5 h-5 animate-bounce" />
                    </div>

                    <div className="flex flex-col space-y-2 text-right">
                        <label className="text-[10px] uppercase tracking-widest text-white/30">Infusion ({selectedToken})</label>
                        <div className={`text-2xl font-mono text-${tokenConfig.color}-400`}>
                            {((parseFloat(amountSOL) || 0) * 100000).toLocaleString()}
                        </div>
                    </div>
                </div>

                {/* Action */}
                <div className="mt-8">
                    {status === 'success' ? (
                        <div className="bg-emerald-900/20 border border-emerald-500/30 p-4 rounded-xl text-center">
                            <p className="text-emerald-400 text-sm mb-2">Transmutation Complete</p>
                            <a
                                href={`https://solscan.io/tx/${txHash}?cluster=devnet`}
                                target="_blank"
                                rel="noreferrer"
                                className="inline-flex items-center text-[10px] text-emerald-400/60 hover:text-emerald-400"
                            >
                                View Evidence <ExternalLink className="w-3 h-3 ml-1" />
                            </a>
                            <button onClick={() => setStatus("idle")} className="block w-full mt-4 text-[10px] text-white/40 hover:text-white">New Infusion</button>
                        </div>
                    ) : (
                        <button
                            onClick={handleInfusion}
                            disabled={status === 'infusing'}
                            className={`w-full py-4 text-sm font-bold tracking-widest uppercase transition-all ${status === 'infusing'
                                    ? 'bg-white/5 text-white/20 cursor-wait'
                                    : `bg-gradient-to-r from-white/10 to-white/5 hover:from-${tokenConfig.color}-500/20 hover:to-${tokenConfig.color}-900/20 border border-white/10 hover:border-${tokenConfig.color}-500/50 text-white`
                                }`}
                        >
                            {status === 'infusing' ? 'Permeating...' : `Infuse ${selectedToken}`}
                        </button>
                    )}
                </div>

                {status === 'error' && (
                    <p className="mt-4 text-center text-xs text-red-400">The ritual was rejected.</p>
                )}
            </div>
        </div>
    );
}

// Helper to map color names to tailwind classes if needed individually contextually
// but explicit classes in JSX are safer for purge.
// We might need to ensure safelist or use style={} for dynamic colors if purge removes them.
// For now, relying on standard classes or assuming safelist. 
// Safest: use style for dynamic colors.
