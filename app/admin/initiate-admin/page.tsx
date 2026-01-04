"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Shield, Key, ArrowRight, Check } from "lucide-react";
import Navigation from "@/components/Navigation";
import { useRouter } from "next/navigation";

export default function AdminInitiationPage() {
    const [secretKey, setSecretKey] = useState("");
    const [isVerified, setIsVerified] = useState(false);
    const [handle, setHandle] = useState("");
    const [password, setPassword] = useState("");
    const router = useRouter();

    const MASTER_RITUAL_KEY = "WZRD_INITIATE_PRIME_001"; // To be shared with the user

    const handleVerifyKey = () => {
        if (secretKey === MASTER_RITUAL_KEY) {
            setIsVerified(true);
        } else {
            alert("The void remains silent. Incorrect key.");
        }
    };

    const handleCreateAdmin = async () => {
        const res = await fetch("/api/auth/register-admin", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
                username: handle,
                password: password,
                ritualKey: secretKey
            })
        });

        if (res.ok) {
            alert("The Throne is claimed. Admin account created.");
            router.push("/login");
        }
    };

    return (
        <div className="min-h-screen bg-black text-white selection:bg-red-500/30">
            <Navigation />

            <main className="pt-40 px-4 flex items-center justify-center">
                <div className="max-w-md w-full">
                    <AnimatePresence mode="wait">
                        {!isVerified ? (
                            <motion.div
                                key="verify"
                                initial={{ opacity: 0, scale: 0.9 }}
                                animate={{ opacity: 1, scale: 1 }}
                                exit={{ opacity: 0, scale: 1.1 }}
                                className="space-y-8 text-center"
                            >
                                <div className="p-6 rounded-full bg-red-500/10 w-24 h-24 mx-auto flex items-center justify-center border border-red-500/20">
                                    <Shield className="w-10 h-10 text-red-500 animate-pulse" />
                                </div>
                                <div>
                                    <h1 className="text-4xl font-serif font-bold text-white mb-2 italic">Ritual of Initiation</h1>
                                    <p className="text-red-500/60 text-xs font-mono uppercase tracking-[0.3em]">Claim the First Voice</p>
                                </div>

                                <div className="space-y-4">
                                    <div className="relative">
                                        <Key className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-[#444]" />
                                        <input
                                            type="password"
                                            value={secretKey}
                                            onChange={(e) => setSecretKey(e.target.value)}
                                            className="w-full bg-[#0a0a0a] border border-red-900/30 rounded-none py-4 pl-12 pr-4 text-white font-mono focus:outline-none focus:border-red-500 transition-colors placeholder:text-[#222]"
                                            placeholder="ENTER RITUAL KEY"
                                        />
                                    </div>
                                    <button
                                        onClick={handleVerifyKey}
                                        className="w-full bg-red-600 text-white py-4 font-bold uppercase tracking-[0.3em] hover:bg-white hover:text-black transition-all"
                                    >
                                        VERIFY LINEAGE
                                    </button>
                                </div>
                            </motion.div>
                        ) : (
                            <motion.div
                                key="create"
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                className="space-y-8"
                            >
                                <div className="text-center">
                                    <h1 className="text-4xl font-serif font-bold text-white mb-2">The Arch-Wzrd</h1>
                                    <p className="text-[#d4af37] text-xs font-mono uppercase tracking-[0.3em]">Configure High Permissions</p>
                                </div>

                                <div className="space-y-6">
                                    <div className="space-y-4">
                                        <input
                                            type="text"
                                            value={handle}
                                            onChange={(e) => setHandle(e.target.value)}
                                            className="w-full bg-[#0a0a0a] border border-[#222] rounded-none py-4 px-4 text-white font-mono focus:outline-none focus:border-[#d4af37] transition-colors"
                                            placeholder="ADMIN HANDLE"
                                        />
                                        <input
                                            type="password"
                                            value={password}
                                            onChange={(e) => setPassword(e.target.value)}
                                            className="w-full bg-[#0a0a0a] border border-[#222] rounded-none py-4 px-4 text-white font-mono focus:outline-none focus:border-[#d4af37] transition-colors"
                                            placeholder="ADMIN ACCESS KEY"
                                        />
                                    </div>
                                    <button
                                        onClick={handleCreateAdmin}
                                        className="w-full bg-[#d4af37] text-black py-4 font-bold uppercase tracking-[0.3em] flex items-center justify-center gap-2 hover:bg-white transition-colors"
                                    >
                                        ASCEND <Check className="w-4 h-4" />
                                    </button>
                                </div>
                            </motion.div>
                        )}
                    </AnimatePresence>
                </div>
            </main>
        </div>
    );
}
