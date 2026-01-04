"use client";

import { useState } from "react";
import { useWallet, useConnection } from "@solana/wallet-adapter-react";
import { PublicKey, Transaction } from "@solana/web3.js";
import { createBurnInstruction, getAssociatedTokenAddress } from "@solana/spl-token";
import { useGritState } from "@/components/GritStateProvider";
import { TOKEN_MINTS } from "@/constants/tokens";
import { Flame, Skull, AlertTriangle, ArrowRight } from "lucide-react";
import { motion } from "framer-motion";

import { SYSTEM_DOCTRINE } from "@/lib/constants/doctrine";

// Entbehrung: Burn
//
// This function destroys value permanently.
// Nothing removed here is recoverable.
// The resulting Mark is the only remainder.
//
// Loss is voluntary.
// The system does not compel clarity.

export default function ThePyre() {
    const { connection } = useConnection(); // Import needed
    const { publicKey, sendTransaction, wallet } = useWallet(); // Destructured sendTransaction and wallet
    const { gritBalance, refreshBalances, scars, addScar } = useGritState(); // Destructured addScar
    const [amount, setAmount] = useState<number>(100);
    const [status, setStatus] = useState<"idle" | "burning" | "scarred">("idle");
    const [txSignature, setTxSignature] = useState("");

    // Ascension Logic
    const initialSacrifice = scars.length > 0 ? scars[0].amount : 100; // Default target base
    const totalSacrificed = scars.reduce((acc, curr) => acc + curr.amount, 0);
    const ascensionTarget = scars.length > 0 ? initialSacrifice * 3 : 300; // Base target

    const handleBurn = async () => {
        if (!publicKey || !wallet) return;
        setStatus("burning");

        // Safety timeout in case user rejects or it hangs
        const timeout = setTimeout(() => {
            // Check the current status to avoid overriding a successful or already failed state
            // This requires `status` to be part of the dependency array if this were a `useCallback`
            // or to use a functional update `setStatus(prev => { if (prev === "burning") return "idle"; return prev; })`
            // For simplicity here, we'll assume `status` is still "burning" if the timeout fires.
            if (status === "burning") {
                console.error("Burn timed out");
                setStatus("idle");
                // In a real app we'd show a toast here
            }
        }, 60000); // 60s timeout

        try {
            // 1. Get Token Account
            // Use Test Mint explicitly as requested
            const mintPubkey = new PublicKey(TOKEN_MINTS.GRIT);

            // Check if ATA exists before proceeding
            const ata = await getAssociatedTokenAddress(mintPubkey, publicKey);

            // 2. Create Burn Instruction
            const decimals = 9; // GRIT Default
            const burnAmount = BigInt(Math.floor(amount * Math.pow(10, decimals)));

            const ix = createBurnInstruction(
                ata,
                mintPubkey,
                publicKey,
                burnAmount
            );

            // 3. Send Transaction
            const tx = new Transaction().add(ix);
            tx.recentBlockhash = (await connection.getLatestBlockhash()).blockhash;
            tx.feePayer = publicKey;

            const signature = await sendTransaction(tx, connection);
            await connection.confirmTransaction(signature, "confirmed");

            // 4. Success State
            clearTimeout(timeout);
            setTxSignature(signature);
            addScar(signature, amount);
            refreshBalances();
            setStatus("scarred");

        } catch (e) {
            clearTimeout(timeout);
            console.error("Burn Failed:", e);
            setStatus("idle");
            alert("Sacrifice Failed. User rejected or insufficient funds."); // Simple feedback
        }
    };

    return (
        <div className="w-full max-w-md mx-auto p-12 py-24 border border-[var(--domain-border)] bg-[var(--domain-panel)] backdrop-blur-md rounded-none relative overflow-hidden group transition-all duration-700">
            {/* Scanlines */}
            <div className={`absolute inset-0 bg-[url('/scanlines.png')] opacity-20 pointer-events-none mix-blend-overlay ${status === "burning" ? "animate-pulse" : ""}`} />

            {/* Header */}
            <div className="flex flex-col items-center justify-center mb-16 relative z-10 text-center">
                <h2 className="text-3xl font-bold text-[var(--domain-accent)] tracking-[0.5em] uppercase flex flex-col items-center gap-4">
                    <Flame className={`w-8 h-8 ${status === "burning" ? "animate-bounce" : "opacity-80"}`} />
                    <span>The Pyre</span>
                </h2>
                <div className="mt-4 text-[10px] text-[var(--domain-text-muted)] border border-[var(--domain-border)] px-3 py-1 uppercase tracking-widest">
                    RING: INITIATE
                </div>
            </div>

            {/* Description - Hidden during burn for focus */}
            {status !== "burning" && (
                <div className="mb-12 text-center text-sm text-[var(--domain-text-muted)] font-mono relative z-10 leading-relaxed">
                    <p className="mb-4">
                        Ascesis separates listeners from believers.<br />
                        From the fire emerges Scars—marks etched into the soul itself.
                    </p>
                </div>
            )}

            {/* Ascension Progress */}
            {scars.length > 0 && status === "idle" && (
                <div className="mb-12 relative z-10 border-t border-b border-[var(--domain-border)] py-6">
                    <div className="flex justify-between text-[10px] text-[var(--domain-text-muted)] uppercase tracking-widest mb-2">
                        <span>Ascension Progress</span>
                        <span>{Math.floor((totalSacrificed / ascensionTarget) * 100)}%</span>
                    </div>
                    <div className="h-0.5 bg-[var(--domain-border)] w-full">
                        <motion.div
                            initial={{ width: 0 }}
                            animate={{ width: `${Math.min(100, (totalSacrificed / ascensionTarget) * 100)}%` }}
                            className="h-full bg-[var(--domain-accent)] shadow-[0_0_20px_var(--domain-accent)]"
                        />
                    </div>
                </div>
            )}

            {/* Input / Void Center */}
            <div className="relative z-10 min-h-[200px] flex flex-col justify-center">
                {status === "idle" && (
                    <div className="space-y-8">
                        {scars.length > 0 && totalSacrificed >= ascensionTarget ? (
                            <div className="text-center">
                                <div className="inline-block p-6 border border-[var(--domain-accent)] bg-[var(--domain-accent-muted)] mb-6 animate-pulse">
                                    <h3 className="text-xl font-bold text-[var(--domain-accent)] uppercase tracking-widest">FIREWALL BREACHED</h3>
                                </div>
                                <p className="text-[var(--domain-text-muted)] text-sm font-mono mb-8">
                                    The veil thins. You have proven your commitment.<br />
                                    Access to Heritage granted.
                                </p>
                                <a
                                    href="/domain/heritage"
                                    className="inline-flex items-center gap-2 px-8 py-4 bg-[var(--domain-accent)] text-black font-bold uppercase tracking-widest hover:bg-white transition-all transform hover:scale-105 shadow-[0_0_30px_var(--domain-accent)]"
                                >
                                    Enter Heritage <ArrowRight className="w-4 h-4" />
                                </a>
                            </div>
                        ) : (
                            <div>
                                <div className="mb-8 relative group/input">
                                    <label className="block text-center text-[10px] uppercase tracking-widest text-[var(--domain-accent)] mb-4 opacity-70">Sacrifice Amount</label>
                                    <input
                                        type="number"
                                        value={amount}
                                        onChange={(e) => setAmount(Number(e.target.value))}
                                        className="w-full bg-transparent border-b border-[var(--domain-border)] text-[var(--domain-accent)] p-4 text-center font-mono text-4xl focus:outline-none focus:border-[var(--domain-accent)] transition-colors placeholder-[var(--domain-border)]"
                                    />
                                    <button
                                        onClick={() => setAmount(gritBalance)}
                                        className="absolute right-0 bottom-4 text-[10px] text-[var(--domain-text-muted)] hover:text-[var(--domain-accent)] uppercase tracking-widest"
                                    >
                                        MAX ({gritBalance.toLocaleString()})
                                    </button>
                                </div>

                                <button
                                    onClick={handleBurn}
                                    disabled={gritBalance < amount || amount <= 0}
                                    className="w-full py-6 bg-[var(--domain-accent-muted)] border border-[var(--domain-accent)] text-[var(--domain-accent)] hover:bg-[var(--domain-accent)] hover:text-black font-bold uppercase tracking-[0.3em] transition-all duration-500 flex items-center justify-center gap-3 hover:shadow-[0_0_30px_var(--domain-accent)] disabled:opacity-30 disabled:cursor-not-allowed group-hover/btn:scale-105"
                                >
                                    <Skull className="w-5 h-5" /> {SYSTEM_DOCTRINE.entbehrung.burn}
                                </button>
                            </div>
                        )}
                    </div>
                )}

                {/* Burning State - The Void Focus */}
                {status === "burning" && (
                    <div className="text-center space-y-8">
                        <motion.div
                            animate={{
                                scale: [1, 1.5, 0.8, 1.2, 1],
                                opacity: [0.5, 1, 0.5, 1, 0.5],
                                rotate: [0, 5, -5, 0]
                            }}
                            transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
                            className="text-[var(--domain-accent)] flex justify-center py-8"
                        >
                            <Flame className="w-24 h-24 filter drop-shadow-[0_0_20px_var(--domain-accent)]" />
                        </motion.div>
                        <p className="text-[var(--domain-accent)] font-mono text-sm tracking-widest animate-pulse">{SYSTEM_DOCTRINE.entbehrung.confirm}</p>
                    </div>
                )}

                {/* Success State */}
                {status === "scarred" && (
                    <div className="text-center space-y-8 animate-fade-in">
                        <div className="text-[var(--domain-accent)] text-6xl flex justify-center mb-4">
                            <Skull className="filter drop-shadow-[0_0_30px_var(--domain-accent)]" />
                        </div>
                        <div>
                            <h3 className="text-xl text-[var(--domain-accent)] font-bold uppercase tracking-[0.2em] mb-2">{SYSTEM_DOCTRINE.entbehrung.success}</h3>
                            <a
                                href={`https://solscan.io/tx/${txSignature}?cluster=devnet`}
                                target="_blank"
                                rel="noreferrer"
                                className="text-[10px] text-[var(--domain-text-muted)] font-mono hover:text-[var(--domain-accent)] underline decoration-dotted transition-colors"
                            >
                                VIEW TRANSACTION
                            </a>
                        </div>
                        <button
                            onClick={() => setStatus("idle")}
                            className="text-xs text-[var(--domain-text-muted)] hover:text-[var(--domain-accent)] uppercase tracking-widest mt-8"
                        >
                            Return to the Pyre
                        </button>
                    </div>
                )}
            </div>

            {/* Background Effects */}
            <div className="absolute bottom-0 left-0 w-full h-1 bg-[var(--domain-accent)] opacity-20" />
        </div>
    );
}
