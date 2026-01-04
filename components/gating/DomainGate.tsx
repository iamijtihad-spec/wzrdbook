"use client";

import { ReactNode } from "react";
import { useGritState } from "@/components/GritStateProvider";
import { checkDomainAccess, Domain } from "@/lib/domain-gates";
import { Lock, ArrowRight, ShieldAlert } from "lucide-react";
import Link from "next/link";
import { motion } from "framer-motion";

interface DomainGateProps {
    domain: Domain;
    children: ReactNode;
}

export default function DomainGate({ domain, children }: DomainGateProps) {
    const gritState = useGritState();
    const { isOpen, reason, requiredAction, requirementLabel } = checkDomainAccess(domain, gritState);

    if (isOpen) {
        return <>{children}</>;
    }

    // Target link for the "Go Back" interaction based on progression
    // If locked at Ascesis -> Go to Market (to buy)? Or Sovereign (Identity).
    // Actually, usually users need to go 'back' one step.
    const backLink =
        domain === Domain.ASCESIS ? "/domain/market" : // Need to buy GRIT (Market is technically 4th, but Buying is separate? actually bonding curve is separate) -> Let's send to Sovereign for now or dedicated "Buy" view? 
            domain === Domain.HERITAGE ? "/domain/ascesis" : // Go burn
                domain === Domain.MARKET ? "/domain/heritage" : // Go stake (Vault is in Heritage)
                    "/domain/sovereign";

    // Correcting the loop:
    // To enter Ascesis (Need GRIT) -> Go to Sovereign (Connect) or maybe we need a public bonding curve link? 
    // Let's assume the Navigation bar allows them to jump to allowed areas. 
    // The "Action" button should guide them to the *solution*.

    let actionLink = "/";
    let actionLabel = "Return";

    if (domain === Domain.ASCESIS) {
        actionLink = "/domain/market"; // Assuming Market/Bonding Curve is accessible OR we send them to a "Get GRIT" flow. Wait, Market is Domain 4. 
        // Dilemma: If Market is Domain 4, but you need GRIT for Domain 2, how do you get GRIT?
        // Solution: The "Bonding Curve" might be in Domain 4, but "Buy" might be a global modal or Sovereign action?
        // Actually, for this specific request, the user said "Market" is the 4th domain.
        // Let's assume Bonding Curve is separate or accessible differently. 
        // OR: Sovereign has the Wallet/Swap?
        // Let's send them to Sovereign to 'Get Prepared'.
        actionLink = "/domain/sovereign";
        actionLabel = "Return to Source";
    } else if (domain === Domain.HERITAGE) {
        actionLink = "/domain/ascesis";
        actionLabel = "Go to the Pyre";
    } else if (domain === Domain.MARKET) {
        actionLink = "/domain/heritage"; // Legacy/Vault (Staking) is usually in Heritage/Heritage... wait. 
        // Based on previous files, TheVault is in Heritage.
        actionLabel = "Go to The Vault";
    }

    return (
        <div className="min-h-screen flex items-center justify-center p-4 bg-black relative overflow-hidden">
            {/* Background Ambience */}
            <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,_var(--tw-gradient-stops))] from-gray-900 via-black to-black opacity-80" />

            <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                className="relative z-10 max-w-md w-full glass-panel p-10 rounded-3xl border border-white/10 text-center shadow-2xl"
            >
                <div className="w-20 h-20 mx-auto bg-white/5 rounded-full flex items-center justify-center mb-6 border border-white/10 text-gray-400">
                    <Lock size={32} />
                </div>

                <div className="mb-8">
                    <span className="text-[10px] uppercase tracking-[0.3em] text-red-500 font-bold mb-2 block">
                        Restricted Access
                    </span>
                    <h2 className="text-3xl font-black text-white mb-3 uppercase tracking-tight">
                        {domain} Locked
                    </h2>
                    <p className="text-gray-400 text-lg font-light leading-relaxed">
                        {reason}
                    </p>
                </div>

                <div className="bg-white/5 rounded-xl p-4 mb-8 border border-white/5">
                    <span className="text-xs text-gray-500 uppercase tracking-widest block mb-1">Requirement</span>
                    <span className="text-white font-mono font-bold">{requirementLabel}</span>
                </div>

                <Link
                    href={actionLink}
                    className="flex w-full items-center justify-center gap-2 py-4 bg-white text-black font-bold uppercase tracking-widest rounded-xl hover:bg-gray-200 transition-colors"
                >
                    {actionLabel} <ArrowRight size={16} />
                </Link>

            </motion.div>
        </div>
    );
}
