"use client";

import { useGritState, DOMAINS } from "@/components/GritStateProvider";
import { Proposal, getProposalStatus } from "@/lib/governance";
import { motion, AnimatePresence } from "framer-motion";
import { Mic2, Activity, Volume2, VolumeX, Clock } from "lucide-react";
import { useState } from "react";

export function VoiceTerminal() {
    const { proposals, userVotes, votingPower, castVote } = useGritState();
    const [selectedProposal, setSelectedProposal] = useState<string | null>(null);

    const activeProposals = proposals.filter(p => getProposalStatus(p) === "Active");
    const pastProposals = proposals.filter(p => getProposalStatus(p) !== "Active");

    return (
        <div className="w-full max-w-4xl mx-auto space-y-8 font-mono">
            {/* Header */}
            <header className="flex items-center justify-between border-b border-[#333] pb-6">
                <div>
                    <h2 className="text-3xl font-bold text-white flex items-center gap-3">
                        <Mic2 className="w-8 h-8 text-[#d4af37]" />
                        THE VOICE
                    </h2>
                    <p className="text-[#666] uppercase tracking-widest text-xs mt-2">
                        Governance Simulation // Resonance Tracking
                    </p>
                </div>
                <div className="text-right">
                    <div className="text-[#555] text-xs uppercase tracking-widest mb-1">Your Resonance</div>
                    <div className="text-2xl font-bold text-[#d4af37] flex items-center justify-end gap-2">
                        <Activity className="w-5 h-5" />
                        {votingPower.toLocaleString()}
                    </div>
                </div>
            </header>

            {/* Active Proposals */}
            <section>
                <h3 className="text-[#d4af37] text-sm uppercase tracking-widest mb-4 flex items-center gap-2">
                    <span className="w-2 h-2 rounded-full bg-green-500 animate-pulse" />
                    Active Signals
                </h3>
                <div className="space-y-4">
                    {activeProposals.map((proposal) => (
                        <ProposalCard
                            key={proposal.id}
                            proposal={proposal}
                            userVote={userVotes.find(v => v.proposalId === proposal.id)?.choice}
                            onVote={(choice) => castVote(proposal.id, choice)}
                            votingPower={votingPower}
                        />
                    ))}
                    {activeProposals.length === 0 && (
                        <div className="p-8 border border-dashed border-[#333] text-center text-[#555]">
                            NO ACTIVE RESONANCE PATTERNS DETECTED
                        </div>
                    )}
                </div>
            </section>

            {/* Past Proposals */}
            <section className="opacity-60">
                <h3 className="text-[#d4af37] text-sm uppercase tracking-widest mb-4 border-t border-[#333] pt-8">
                    Echoes (Past Decisions)
                </h3>
                <div className="space-y-4">
                    {pastProposals.map((proposal) => (
                        <ProposalCard
                            key={proposal.id}
                            proposal={proposal}
                            userVote={userVotes.find(v => v.proposalId === proposal.id)?.choice}
                            readOnly
                        />
                    ))}
                </div>
            </section>
        </div>
    );
}

function ProposalCard({
    proposal,
    userVote,
    onVote,
    readOnly = false,
    votingPower = 0
}: {
    proposal: Proposal;
    userVote?: "amplify" | "dampen";
    onVote?: (choice: "amplify" | "dampen") => void;
    readOnly?: boolean;
    votingPower?: number;
}) {
    const totalPower = proposal.resonance.amplify + proposal.resonance.dampen;
    const amplifyPercent = totalPower > 0 ? (proposal.resonance.amplify / totalPower) * 100 : 0;
    const dampenPercent = totalPower > 0 ? (proposal.resonance.dampen / totalPower) * 100 : 0;

    // Calculate domain color
    const domainColor =
        proposal.domain === "ASCESIS" ? "text-red-500 border-red-500/30" :
            proposal.domain === "HERITAGE" ? "text-[#d4af37] border-[#d4af37]/30" :
                "text-white border-white/30";

    const daysLeft = Math.max(0, Math.ceil((proposal.deadline - Date.now()) / (1000 * 60 * 60 * 24)));

    return (
        <div className={`relative bg-[#0a0a0a] border ${domainColor} p-6 transition-all hover:bg-[#111]`}>
            {/* Domain Tag */}
            <div className={`absolute top-0 right-0 px-3 py-1 text-[10px] font-bold uppercase border-b border-l ${domainColor}`}>
                {proposal.domain} // {proposal.status}
            </div>

            <div className="flex justify-between items-start mb-4">
                <div>
                    <h4 className="text-xl font-bold text-white mb-2">{proposal.title}</h4>
                    <p className="text-[#888] text-sm max-w-2xl leading-relaxed">{proposal.description}</p>
                </div>
            </div>

            {/* Resonance Meter */}
            <div className="mb-6 space-y-2">
                <div className="flex justify-between text-xs uppercase tracking-widest text-[#555]">
                    <span>Amplify: {proposal.resonance.amplify.toLocaleString()}</span>
                    <span>Dampen: {proposal.resonance.dampen.toLocaleString()}</span>
                </div>
                <div className="h-2 w-full bg-[#1a1a1a] flex overflow-hidden">
                    <div
                        className="h-full bg-indigo-500 transition-all duration-1000 ease-out"
                        style={{ width: `${amplifyPercent}%` }}
                    />
                    <div
                        className="h-full bg-orange-900 transition-all duration-1000 ease-out"
                        style={{ width: `${dampenPercent}%` }}
                    />
                </div>
            </div>

            {/* Actions */}
            <div className="flex items-center justify-between mt-6 pt-6 border-t border-[#222]">
                <div className="text-xs text-[#555] flex items-center gap-2">
                    <Clock className="w-3 h-3" />
                    {daysLeft > 0 ? `${daysLeft} DAYS REMAINING` : "CLOSED"}
                </div>

                {!readOnly && (
                    <div className="flex gap-4">
                        <button
                            onClick={() => onVote?.("dampen")}
                            disabled={!!userVote}
                            className={`px-6 py-2 border border-[#333] text-xs font-bold uppercase tracking-widest flex items-center gap-2 transition-colors 
                                ${userVote === "dampen" ? "bg-orange-900/50 border-orange-900 text-orange-200" : "hover:bg-[#1a1a1a] text-[#666] hover:text-white"}
                                ${!!userVote && userVote !== "dampen" ? "opacity-30 cursor-not-allowed" : ""}
                            `}
                        >
                            <VolumeX className="w-4 h-4" />
                            Dampen
                        </button>
                        <button
                            onClick={() => onVote?.("amplify")}
                            disabled={!!userVote}
                            className={`px-6 py-2 border border-indigo-500/30 text-xs font-bold uppercase tracking-widest flex items-center gap-2 transition-colors 
                                ${userVote === "amplify" ? "bg-indigo-500/20 border-indigo-500 text-indigo-300" : "hover:bg-indigo-500/10 text-indigo-400 hover:text-white"}
                                ${!!userVote && userVote !== "amplify" ? "opacity-30 cursor-not-allowed" : ""}
                            `}
                        >
                            <Volume2 className="w-4 h-4" />
                            Amplify
                        </button>
                    </div>
                )}

                {userVote && (
                    <div className="text-xs text-[#555] font-mono">
                        RESONANCE ESTABLISHED // {userVote.toUpperCase()}
                    </div>
                )}
            </div>
        </div>
    )
}
