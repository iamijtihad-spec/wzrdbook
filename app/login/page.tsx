"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { User, Shield, ArrowRight } from "lucide-react";
import Navigation from "@/components/Navigation";
import { useRouter } from "next/navigation";

export default function LoginPage() {
    const [handle, setHandle] = useState("");
    const [password, setPassword] = useState("");
    const [error, setError] = useState("");
    const [isLoading, setIsLoading] = useState(false);
    const router = useRouter();

    const handleLogin = async () => {
        if (!handle || !password) {
            setError("Identification required.");
            return;
        }

        setError("");
        setIsLoading(true);

        try {
            const res = await fetch("/api/auth/login", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    username: handle.toLowerCase(),
                    password: password,
                })
            });

            const data = await res.json();

            if (res.ok) {
                localStorage.setItem("wzrd_handle", handle);
                router.push("/domain/sovereign");
            } else {
                setError(data.error || "Signal mismatch.");
            }
        } catch (e) {
            setError("Connection severed.");
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="min-h-screen bg-black text-white selection:bg-[#d4af37]/30">
            <Navigation />

            <main className="pt-40 px-4 flex items-center justify-center">
                <div className="max-w-md w-full space-y-12">
                    <div className="text-center">
                        <h1 className="text-4xl font-serif font-bold text-white mb-2">Dashboard Access</h1>
                        <p className="text-[#666] text-sm font-mono uppercase tracking-widest">Identify Yourself</p>
                    </div>

                    <div className="space-y-6">
                        {error && (
                            <motion.div
                                initial={{ opacity: 0, scale: 0.95 }}
                                animate={{ opacity: 1, scale: 1 }}
                                className="bg-red-500/10 border border-red-500/20 p-4 text-red-500 text-xs font-mono uppercase tracking-widest text-center"
                            >
                                {error}
                            </motion.div>
                        )}
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

                    <div className="space-y-4">
                        <button
                            onClick={handleLogin}
                            disabled={isLoading}
                            className="w-full bg-white text-black py-4 font-bold uppercase tracking-[0.3em] flex items-center justify-center gap-2 hover:bg-[#d4af37] transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                            {isLoading ? "Authenticating..." : "Authorize"} <ArrowRight className="w-4 h-4" />
                        </button>
                        <p className="text-center text-[#444] text-[10px] uppercase tracking-widest">
                            New Signal? <a href="/register" className="text-[#d4af37] hover:underline">Establish Link</a>
                        </p>
                    </div>
                </div>
            </main>
        </div>
    );
}
