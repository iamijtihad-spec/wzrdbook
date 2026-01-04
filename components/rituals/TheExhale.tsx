
"use client";

import { useState, useRef } from 'react';
import { useConnection, useWallet } from '@solana/wallet-adapter-react';
import { PublicKey, Transaction } from '@solana/web3.js';
import { createBurnInstruction, getAssociatedTokenAddress } from '@solana/spl-token';
import { motion, useAnimation } from 'framer-motion';
import { TOKEN_MINTS } from '@/constants/tokens';
import { useGritState } from '@/components/GritStateProvider';
import { validateExhale } from '@/lib/protocol/reverse-bridge';
import { Loader2, Wind } from 'lucide-react';

export default function TheExhale() {
    const { connection } = useConnection();
    const { publicKey, sendTransaction } = useWallet();
    const { gritBalance, exitCapacity, efficiencyMultiplier } = useGritState();

    const [amountSOL, setAmountSOL] = useState<string>("0.1");
    const [status, setStatus] = useState<"idle" | "holding" | "releasing" | "success" | "error">("idle");
    const [result, setResult] = useState<any>(null);

    const controls = useAnimation();
    const holdTimer = useRef<NodeJS.Timeout | null>(null);

    // Validate Input
    const requested = parseFloat(amountSOL) || 0;
    const validation = validateExhale(
        publicKey?.toBase58() || "",
        requested,
        { gritBalance, exitCapacity, efficiencyMultiplier }
    );

    const handleRelease = async () => {
        if (!publicKey) return;
        setStatus("releasing");

        try {
            // 1. Burn GRIT on Devnet
            const gritMint = new PublicKey(TOKEN_MINTS.GRIT);
            const userATA = await getAssociatedTokenAddress(gritMint, publicKey);

            const burnAmount = Math.floor(validation.tokenBurnRequired * 1_000_000_000); // Decimals 9

            const burnIx = createBurnInstruction(
                userATA,
                gritMint,
                publicKey,
                burnAmount
            );

            const tx = new Transaction().add(burnIx);
            const signature = await sendTransaction(tx, connection);

            console.log("Burnt GRIT:", signature);

            await connection.confirmTransaction(signature, 'confirmed');

            // 2. Call Oracle to Release SOL
            const response = await fetch('/api/bridge/release', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    signature,
                    user: publicKey.toBase58(),
                    amountSOL: requested
                })
            });

            const data = await response.json();

            if (!response.ok) throw new Error(data.error || "Oracle rejected.");

            setResult(data);
            setStatus("success");

        } catch (err: any) {
            console.error("Exhale Failed:", err);

            // Check for User Rejection
            if (err.message?.includes("User rejected") || err.name === "WalletSendTransactionError") {
                setStatus("idle");
                return;
            }

            setStatus("error");
        }
    };

    const handlePressStart = () => {
        if (!validation.isEligible || (status !== 'idle' && status !== 'error')) return;
        setStatus("holding");

        // Start Hold Timer (2 Seconds to confirm)
        controls.start({
            scale: [1, 1.05, 1],
            opacity: [0.8, 1, 0.8],
            transition: { duration: 2, repeat: 0 }
        });

        holdTimer.current = setTimeout(() => {
            handleRelease();
        }, 2000); // 2s hold
    };

    const handlePressEnd = () => {
        if (status === 'holding') {
            if (holdTimer.current) clearTimeout(holdTimer.current);
            setStatus("idle");
            controls.start({ scale: 1, opacity: 1, transition: { duration: 0.2 } });
        }
    };

    const handleReset = () => {
        setStatus("idle");
        setResult(null);
        setAmountSOL("0.1");
    };

    return (
        <div className="relative w-full max-w-lg mx-auto p-8 rounded-xl border border-white/5 bg-black/80 backdrop-blur-md overflow-hidden shadow-2xl">
            {/* Smoked Glass Overlay */}
            <div className="absolute inset-0 bg-white/5 pointer-events-none" />

            <div className="relative z-10 flex flex-col space-y-6">
                <div className="flex items-center justify-between">
                    <h2 className="text-xl font-mono text-white/80 tracking-widest uppercase">The Exhale</h2>
                    {status !== 'idle' && status !== 'releasing' && (
                        <button onClick={() => setStatus('idle')} className="text-[10px] uppercase text-white/40 hover:text-white underline">
                            Back
                        </button>
                    )}
                    {status === 'idle' && <Wind className="text-white/40 w-5 h-5" />}
                </div>

                {/* Status / Output */}
                <div className="grid grid-cols-2 gap-4 text-[10px] uppercase tracking-widest font-mono">
                    <div className="p-3 border border-white/10 rounded bg-black/50">
                        <span className="text-white/40 block mb-1">Lung Capacity</span>
                        <span className="text-white text-lg">{exitCapacity.toFixed(2)} SOL</span>
                    </div>
                    <div className="p-3 border border-white/10 rounded bg-black/50">
                        <span className="text-white/40 block mb-1">Efficiency</span>
                        <span className="text-amber-500 text-lg">{efficiencyMultiplier.toFixed(2)}x</span>
                    </div>
                </div>

                {/* Input */}
                <div className="space-y-2">
                    <label className="text-[10px] uppercase text-white/40">Request (SOL)</label>
                    <input
                        type="number"
                        value={amountSOL}
                        onChange={e => setAmountSOL(e.target.value)}
                        className="w-full bg-transparent border-b border-white/20 text-3xl font-light text-white outline-none py-2 font-mono focus:border-white/50 transition-colors"
                        disabled={status !== 'idle'} // Strictly disable if not idle
                    />
                    {!validation.isEligible && (
                        <p className="text-red-500 text-xs mt-1 font-mono">{validation.error}</p>
                    )}
                </div>

                {/* Hold Button */}
                <div className="pt-4 flex justify-center">
                    {status === 'success' ? (
                        <div className="text-center space-y-2 animate-in fade-in zoom-in">
                            <div className="text-emerald-400 text-sm font-mono tracking-widest border border-emerald-500/30 p-4 rounded bg-emerald-900/10">
                                ORACLE DISPATCHED
                            </div>
                            <div className="text-[10px] text-white/30 font-mono break-all">
                                Ref: {result?.txId}
                            </div>
                            <button onClick={handleReset} className="text-white/50 text-xs hover:text-white underline decoration-white/30 underline-offset-4">
                                Reset
                            </button>
                        </div>
                    ) : (
                        <div className="flex flex-col items-center space-y-2">
                            <motion.button
                                onMouseDown={handlePressStart}
                                onMouseUp={handlePressEnd}
                                onMouseLeave={handlePressEnd}
                                onTouchStart={handlePressStart}
                                onTouchEnd={handlePressEnd}
                                animate={controls}
                                disabled={!validation.isEligible || status === 'releasing'}
                                className={`
                                    relative w-24 h-24 rounded-full border-2 flex items-center justify-center 
                                    transition-all duration-500
                                    ${status === 'releasing' ? 'border-white/20 animate-pulse' :
                                        status === 'error' ? 'border-red-500/50 hover:border-red-400 hover:bg-red-900/10 cursor-pointer' :
                                            validation.isEligible ? 'border-white/20 hover:border-white/60 hover:bg-white/5 cursor-pointer' :
                                                'border-white/5 opacity-50 cursor-not-allowed'}
                                `}
                            >
                                {status === 'releasing' ? (
                                    <Loader2 className="w-8 h-8 text-white/50 animate-spin" />
                                ) : status === 'holding' ? (
                                    <div className="absolute inset-0 rounded-full border-4 border-white/80 animate-[ping_2s_ease-out_infinite]" />
                                ) : status === 'error' ? (
                                    <span className="text-[10px] uppercase tracking-widest text-red-400">Retry</span>
                                ) : (
                                    <span className="text-[10px] uppercase tracking-widest text-white/50">Hold</span>
                                )}
                            </motion.button>
                            <span className="text-[10px] uppercase text-white/20 tracking-widest">
                                {status === 'idle' ? 'Hold to Release' : status === 'holding' ? 'Exhaling...' : status === 'error' ? 'Ritual Failed' : ''}
                            </span>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};
