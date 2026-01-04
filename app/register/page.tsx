"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useWallet } from "@solana/wallet-adapter-react";
import { WalletMultiButton } from "@solana/wallet-adapter-react-ui";
import { User, Shield, Disc as Discord, ArrowRight, Check } from "lucide-react";
import Navigation from "@/components/Navigation";
import { useRouter } from "next/navigation";

export default function RegisterPage() {
    const [step, setStep] = useState(1);
    const [handle, setHandle] = useState("");
    const [password, setPassword] = useState("");
    const { publicKey, connected } = useWallet();
    const [discordLinked, setDiscordLinked] = useState(false);
    const [discordUser, setDiscordUser] = useState<{ id: string, username: string } | null>(null);
    const router = useRouter();

    // Persist state to local storage
    const saveState = (h = handle, p = password, s = step) => {
        if (typeof window !== "undefined") {
            localStorage.setItem("wzrd_reg_state", JSON.stringify({ handle: h, password: p, step: s }));
        }
    };

    // Save state on every change
    useEffect(() => {
        if (handle || password) {
            saveState();
        }
    }, [handle, password, step]);

    // Restore state on mount
    useEffect(() => {
        if (typeof window !== "undefined") {
            const saved = localStorage.getItem("wzrd_reg_state");
            if (saved) {
                const data = JSON.parse(saved);
                setHandle(data.handle || "");
                setPassword(data.password || "");
                setStep(data.step || 1);
            }

            // Check URL for Discord response
            const params = new URLSearchParams(window.location.search);
            if (params.get("discord_linked") === "true") {
                setDiscordLinked(true);
                setDiscordUser({
                    id: params.get("discord_id") || "",
                    username: params.get("discord_username") || ""
                });
                setStep(3);
            }
        }
    }, []);

    const handleDiscordAuth = () => {
        saveState();
        const clientId = process.env.NEXT_PUBLIC_DISCORD_APP_ID || "1449490953256566837";
        const redirectUri = encodeURIComponent(`${window.location.origin}/api/auth/discord`);
        const scope = encodeURIComponent("identify");
        // Use state to pass the registration flag safely
        const state = encodeURIComponent("from_registration=true");
        window.location.href = `https://discord.com/api/oauth2/authorize?client_id=${clientId}&redirect_uri=${redirectUri}&response_type=code&scope=${scope}&state=${state}`;
    };

    const handleCreateAccount = async () => {
        if (!handle || !password) return;
        setStep(2);
    };

    const handleNext = () => {
        if (step === 2 && connected) setStep(3);
    };

    const handleComplete = async () => {
        if (!handle || !password) {
            alert(`Missing Required Fields:\nHandle: ${handle ? 'OK' : 'MISSING'}\nPassword: ${password ? 'OK' : 'MISSING'}`);
            return;
        }

        // Final registration API call here
        const res = await fetch("/api/auth/register", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
                username: handle,
                password: password,
                wallet: publicKey?.toBase58(),
                discordId: discordUser?.id
            })
        });

        if (res.ok) {
            localStorage.setItem("wzrd_handle", handle);
            localStorage.removeItem("wzrd_reg_state");
            router.push("/domain/sovereign");
        } else {
            const data = await res.json();
            alert(`Registration failed: ${data.error || 'Unknown error'}`);
        }
    };

    return (
        <div className="min-h-screen bg-black text-white selection:bg-[#d4af37]/30">
            <Navigation />

            <main className="pt-32 px-4 flex items-center justify-center">
                <div className="max-w-md w-full">
                    {/* Stepper */}
                    <div className="flex justify-between mb-12 relative">
                        {[1, 2, 3].map((s) => (
                            <div key={s} className="relative z-10 flex flex-col items-center gap-2">
                                <div className={`w-10 h-10 rounded-full flex items-center justify-center border transition-all duration-500 ${step >= s ? 'bg-[#d4af37] border-[#d4af37] text-black shadow-[0_0_20px_#d4af37]/40' : 'bg-black border-[#222] text-[#444]'}`}>
                                    {step > s ? <Check className="w-5 h-5" /> : s}
                                </div>
                                <span className={`text-[10px] uppercase tracking-widest font-mono ${step >= s ? 'text-[#d4af37]' : 'text-[#444]'}`}>
                                    {s === 1 ? 'Legacy' : s === 2 ? 'Identity' : 'Resonance'}
                                </span>
                            </div>
                        ))}
                        <div className="absolute top-5 left-0 right-0 h-[1px] bg-[#222] -z-0" />
                        <motion.div
                            initial={false}
                            animate={{ scaleX: (step - 1) / 2 }}
                            className="absolute top-5 left-0 right-0 h-[1px] bg-[#d4af37] origin-left -z-0"
                        />
                    </div>

                    <AnimatePresence mode="wait">
                        {step === 1 && (
                            <motion.div
                                key="step1"
                                initial={{ opacity: 0, x: 20 }}
                                animate={{ opacity: 1, x: 0 }}
                                exit={{ opacity: 0, x: -20 }}
                                className="space-y-6"
                            >
                                <div className="text-center mb-8">
                                    <h1 className="text-4xl font-serif font-bold text-white mb-2">Claim Identity</h1>
                                    <p className="text-[#666] text-sm font-mono uppercase tracking-widest">Establish your presence in the realm</p>
                                </div>

                                <div className="space-y-4">
                                    <div className="group">
                                        <label className="text-[10px] uppercase tracking-[0.2em] text-[#444] group-focus-within:text-[#d4af37] transition-colors">Handle</label>
                                        <div className="relative mt-2">
                                            <User className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-[#444]" />
                                            <input
                                                type="text"
                                                value={handle}
                                                onChange={(e) => setHandle(e.target.value)}
                                                className="w-full bg-[#0a0a0a] border border-[#222] rounded-none py-4 pl-12 pr-4 text-white font-mono focus:outline-none focus:border-[#d4af37] transition-colors"
                                                placeholder="WZRD_001"
                                            />
                                        </div>
                                    </div>
                                    <div className="group">
                                        <label className="text-[10px] uppercase tracking-[0.2em] text-[#444] group-focus-within:text-[#d4af37] transition-colors">Access Key</label>
                                        <div className="relative mt-2">
                                            <Shield className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-[#444]" />
                                            <input
                                                type="password"
                                                value={password}
                                                onChange={(e) => setPassword(e.target.value)}
                                                className="w-full bg-[#0a0a0a] border border-[#222] rounded-none py-4 pl-12 pr-4 text-white font-mono focus:outline-none focus:border-[#d4af37] transition-colors"
                                                placeholder="••••••••"
                                            />
                                        </div>
                                    </div>
                                </div>

                                <button
                                    onClick={handleCreateAccount}
                                    disabled={!handle || !password}
                                    className="w-full bg-white text-black py-4 font-bold uppercase tracking-[0.3em] flex items-center justify-center gap-2 hover:bg-[#d4af37] transition-colors disabled:opacity-30 disabled:cursor-not-allowed"
                                >
                                    Begin Trial <ArrowRight className="w-4 h-4" />
                                </button>
                            </motion.div>
                        )}

                        {step === 2 && (
                            <motion.div
                                key="step2"
                                initial={{ opacity: 0, x: 20 }}
                                animate={{ opacity: 1, x: 0 }}
                                exit={{ opacity: 0, x: -20 }}
                                className="space-y-6"
                            >
                                <div className="text-center mb-8">
                                    <h1 className="text-4xl font-serif font-bold text-white mb-2">Link Wallet</h1>
                                    <p className="text-[#666] text-sm font-mono uppercase tracking-widest">Connect your digital presence</p>
                                </div>

                                <div className="p-8 border border-[#222] bg-[#0a0a0a] flex flex-col items-center gap-6">
                                    <div className={`p-4 rounded-full border ${connected ? 'border-[#d4af37] text-[#d4af37]' : 'border-[#222] text-[#444]'}`}>
                                        <User className="w-12 h-12" />
                                    </div>
                                    <WalletMultiButton className="w-full !bg-white !text-black !rounded-none !h-14 !font-mono !uppercase !tracking-widest !font-bold hover:!bg-[#d4af37] !transition-colors" />
                                </div>

                                <button
                                    onClick={handleNext}
                                    disabled={!connected}
                                    className="w-full bg-white text-black py-4 font-bold uppercase tracking-[0.3em] flex items-center justify-center gap-2 hover:bg-[#d4af37] transition-colors disabled:opacity-30 disabled:cursor-not-allowed"
                                >
                                    Continue <ArrowRight className="w-4 h-4" />
                                </button>
                            </motion.div>
                        )}

                        {step === 3 && (
                            <motion.div
                                key="step3"
                                initial={{ opacity: 0, x: 20 }}
                                animate={{ opacity: 1, x: 0 }}
                                exit={{ opacity: 0, x: -20 }}
                                className="space-y-6"
                            >
                                <div className="text-center mb-8">
                                    <h1 className="text-4xl font-serif font-bold text-white mb-2">Link Discord</h1>
                                    <p className="text-[#666] text-sm font-mono uppercase tracking-widest">Establish community resonance</p>
                                </div>

                                <div className="p-8 border border-[#222] bg-[#0a0a0a] flex flex-col items-center gap-6">
                                    <div className={`p-4 rounded-full border ${discordLinked ? 'border-[#5865F2] text-[#5865F2]' : 'border-[#222] text-[#444]'}`}>
                                        <Discord className="w-12 h-12" />
                                    </div>
                                    {discordLinked ? (
                                        <div className="text-center font-mono text-xs text-[#5865F2] animate-pulse">
                                            LINKED AS @{discordUser?.username || 'WZRD'}
                                        </div>
                                    ) : (
                                        <button
                                            onClick={handleDiscordAuth}
                                            className="w-full bg-[#5865F2] text-white py-4 font-bold uppercase tracking-[0.3em] flex items-center justify-center gap-2 hover:bg-[#4752c4] transition-colors"
                                        >
                                            Authorize Discord
                                        </button>
                                    )}
                                </div>

                                <button
                                    onClick={handleComplete}
                                    disabled={!discordLinked}
                                    className="w-full bg-[#d4af37] text-black py-4 font-bold uppercase tracking-[0.3em] flex items-center justify-center gap-2 hover:bg-white transition-colors disabled:opacity-30"
                                >
                                    Enter Sovereign Domain <Check className="w-4 h-4" />
                                </button>
                            </motion.div>
                        )}
                    </AnimatePresence>
                </div>
            </main>
        </div>
    );
}
