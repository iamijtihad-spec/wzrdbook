"use client";
import { useState, useEffect } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { WalletMultiButton } from "@solana/wallet-adapter-react-ui";
import { useGritState } from "@/components/GritStateProvider";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import { Lock, Unlock, Mail, Home } from "lucide-react";
import { checkDomainAccess, Domain } from "@/lib/domain-gates";

import config from "@/config/artist.config.json";

export default function Navigation() {
    const { scars, gritBalance, stakedAmount, stakeStartTime, wzrdHandle, fiatBalance } = useGritState();
    const router = useRouter();
    const pathname = usePathname();
    const [mounted, setMounted] = useState(false);

    // Construct a partial state object for checking access
    // checkDomainAccess expects Partial<GritState>
    const authState = { scars, gritBalance, stakedAmount, stakeStartTime };

    const domains = [
        { id: Domain.SOVEREIGN, label: "Dashboard", path: "/domain/sovereign" }, // Checking/Feed
        { id: Domain.HERITAGE, label: "Vault", path: "/domain/heritage" },       // Savings/Stake
        { id: Domain.ASCESIS, label: "Earn", path: "/domain/ascesis" },          // Challenges
        { id: Domain.MARKET, label: "Market", path: "/domain/market" },
        { id: "ADMIN", label: "Admin", path: "/admin", isAdminOnly: true },
    ];

    const handleLogout = async () => {
        try {
            await fetch("/api/auth/logout", { method: "POST" });
            localStorage.removeItem("wzrd_handle");
            router.push("/register");
        } catch (e) {
            console.error("Logout failed", e);
        }
    };

    useEffect(() => {
        setMounted(true);
    }, []);

    return (
        <motion.nav
            initial={{ y: -100 }}
            animate={{ y: 0 }}
            transition={{ type: "spring", stiffness: 100, damping: 20 }}
            className={`fixed top-4 left-0 right-0 z-50 mx-auto max-w-7xl px-4`}
        >
            <div className={`
                backdrop-blur-xl bg-black/40 border border-white/10 rounded-2xl px-6 h-16 flex items-center justify-between
                shadow-[0_0_20px_rgba(0,0,0,0.5)]
            `}>
                <div className="flex items-center gap-8">
                    <Link href="/" className="text-white font-black text-xl tracking-tighter hover:text-amber-500 transition-colors">
                        {config.artist.name.toUpperCase()}
                    </Link>

                    {/* Bank Balance Display */}
                    {mounted && (
                        <div className="hidden md:flex items-center gap-2 px-3 py-1 bg-white/5 rounded-full border border-white/10 ml-4">
                            <span className="text-[10px] text-gray-500 font-mono uppercase">BANK</span>
                            <span className="text-sm text-green-400 font-mono font-bold">${(fiatBalance || 0).toLocaleString(undefined, { minimumFractionDigits: 2 })}</span>
                        </div>
                    )}

                    {/* Domain Links */}
                    <div className="hidden md:flex items-center gap-1">
                        {domains.map((d: any) => {
                            // Admin check
                            if (d.isAdminOnly) {
                                if (wzrdHandle?.toLowerCase() !== config.artist.name.toLowerCase()) {
                                    return null;
                                }
                                const isActive = pathname === d.path;
                                return (
                                    <Link
                                        key={d.id}
                                        href={d.path}
                                        className={`
                                            relative group flex items-center gap-2 px-3 py-1.5 rounded-lg text-xs font-mono tracking-wider transition-all
                                            ${isActive ? "bg-white/10 text-white font-bold" : "text-gray-500 hover:text-gray-300 hover:bg-white/5"}
                                        `}
                                    >
                                        {d.label.toUpperCase()}
                                    </Link>
                                );
                            }

                            const access = checkDomainAccess(d.id as Domain, authState);
                            const isActive = pathname === d.path;
                            const isLocked = !access.isOpen;

                            return (
                                <Link
                                    key={d.id}
                                    href={d.path}
                                    className={`
                                        relative group flex items-center gap-2 px-3 py-1.5 rounded-lg text-xs font-mono tracking-wider transition-all
                                        ${isActive ? "bg-white/10 text-white font-bold" : "text-gray-500 hover:text-gray-300 hover:bg-white/5"}
                                        ${isLocked ? "opacity-50 cursor-not-allowed" : ""}
                                    `}
                                >
                                    {d.label.toUpperCase()}
                                    {isLocked && <Lock size={10} className="text-red-500" />}
                                </Link>
                            );
                        })}
                    </div>
                </div>

                <div className="hidden md:block">
                    <div className="flex items-center space-x-4">
                        <Link
                            href="/contact"
                            className="flex items-center justify-center w-8 h-8 rounded-lg border border-white/10 text-gray-500 hover:text-[#d4af37] hover:border-[#d4af37]/50 transition-all bg-white/5"
                        >
                            <Mail size={12} />
                        </Link>

                        {/* Evolution Badge */}
                        {mounted && scars && (
                            <div className={`
                                px-3 py-1.5 rounded-lg border text-[10px] font-mono tracking-widest uppercase font-bold
                                ${scars.length >= 3
                                    ? "bg-white/10 border-white/50 text-white shadow-[0_0_15px_white] animate-pulse" // Ascended
                                    : scars.length >= 1
                                        ? "bg-red-900/20 border-red-500/50 text-red-400" // Survivor
                                        : "bg-gray-800/50 border-gray-700 text-gray-500" // Initiate
                                }
                            `}>
                                {scars.length >= 3 ? "ASCENDED" : scars.length >= 1 ? "SURVIVOR" : "INITIATE"}
                            </div>
                        )}

                        {mounted && (
                            <button
                                onClick={handleLogout}
                                className="px-3 py-1.5 rounded-lg border border-white/10 text-gray-500 text-[10px] font-mono uppercase tracking-widest hover:bg-red-500/10 hover:text-red-400 hover:border-red-500/50 transition-all"
                            >
                                Leave Realm
                            </button>
                        )}

                        {mounted && (
                            <WalletMultiButton style={{
                                backgroundColor: 'rgba(255,255,255,0.05)',
                                color: 'white',
                                fontWeight: 'bold',
                                border: '1px solid rgba(255,255,255,0.1)',
                                borderRadius: '12px',
                                backdropFilter: 'blur(10px)',
                                fontFamily: 'monospace',
                                height: '40px',
                                fontSize: '12px'
                            }} />
                        )}
                    </div>
                </div>
            </div>
        </motion.nav>
    );
}
