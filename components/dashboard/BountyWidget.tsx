
"use client";

import { useEffect, useState } from "react";
import {
    CheckCircle2,
    Circle,
    MessageCircle,
    Shield,
    Vote,
    Twitter,
    Video,
    UserPlus,
    Scroll,
    Headphones,
    ExternalLink,
    Zap
} from "lucide-react";

interface Quest {
    id: string;
    title: string;
    description: string;
    reward: string;
    actionLink: string;
    icon: string;
}

interface BountiesData {
    weekly: Quest[];
    social: Quest[];
    discovery: Quest[];
}

const ICON_MAP: Record<string, any> = {
    Vote, Shield, MessageCircle, Twitter, Video, UserPlus, Scroll, Headphones
};

export default function BountyWidget() {
    const [bounties, setBounties] = useState<BountiesData | null>(null);
    const [activeTab, setActiveTab] = useState<"weekly" | "social" | "discovery">("weekly");
    const [completed, setCompleted] = useState<Set<string>>(new Set());

    useEffect(() => {
        // Load config
        import("@/config/bounties.json").then(data => {
            setBounties(data.default as unknown as BountiesData);
        });

        // Load local completion state (mock)
        const saved = localStorage.getItem("completed_bounties");
        if (saved) setCompleted(new Set(JSON.parse(saved)));
    }, []);

    const handleClaim = (id: string) => {
        // In a real app, this would verify backend logic
        // For now, we simulate a "Claim" action that marks it complete locally
        const newSet = new Set(completed);
        newSet.add(id);
        setCompleted(newSet);
        localStorage.setItem("completed_bounties", JSON.stringify(Array.from(newSet)));

        // Confetti or Sound effect here
    };

    if (!bounties) return <div className="animate-pulse bg-white/5 h-64 rounded-2xl" />;

    const currentQuests = bounties[activeTab];

    return (
        <div className="glass-panel p-6 rounded-2xl border border-white/10 relative overflow-hidden">
            {/* Header */}
            <div className="flex justify-between items-center mb-6">
                <div className="flex items-center gap-3">
                    <div className="p-2 bg-yellow-500/20 rounded-lg text-yellow-500">
                        <Zap size={20} />
                    </div>
                    <div>
                        <h3 className="font-bold text-white text-lg">Bounty Board</h3>
                        <p className="text-xs text-gray-400">Earn CHI by contributing</p>
                    </div>
                </div>
            </div>

            {/* Tabs */}
            <div className="flex gap-2 mb-6 p-1 bg-black/20 rounded-lg">
                {(["weekly", "social", "discovery"] as const).map(tab => (
                    <button
                        key={tab}
                        onClick={() => setActiveTab(tab)}
                        className={`flex-1 py-2 text-xs font-bold uppercase tracking-wider rounded-md transition-all ${activeTab === tab
                                ? "bg-white/10 text-white shadow-lg"
                                : "text-gray-500 hover:text-gray-300"
                            }`}
                    >
                        {tab}
                    </button>
                ))}
            </div>

            {/* List */}
            <div className="space-y-4 max-h-[400px] overflow-y-auto pr-2 custom-scrollbar">
                {currentQuests.map((quest) => {
                    const Icon = ICON_MAP[quest.icon] || Circle;
                    const isDone = completed.has(quest.id);

                    return (
                        <div
                            key={quest.id}
                            className={`relative p-4 rounded-xl border transition-all group ${isDone
                                    ? "bg-green-500/10 border-green-500/30"
                                    : "bg-black/20 border-white/5 hover:border-white/20"
                                }`}
                        >
                            <div className="flex gap-4">
                                <div className={`shrink-0 w-10 h-10 rounded-full flex items-center justify-center ${isDone ? "bg-green-500 text-black" : "bg-white/5 text-gray-400"
                                    }`}>
                                    {isDone ? <CheckCircle2 size={20} /> : <Icon size={20} />}
                                </div>

                                <div className="flex-grow">
                                    <h4 className={`font-bold text-sm ${isDone ? "text-green-400" : "text-white"}`}>
                                        {quest.title}
                                    </h4>
                                    <p className="text-xs text-gray-400 mt-1 leading-relaxed">
                                        {quest.description}
                                    </p>

                                    <div className="flex items-center justify-between mt-3">
                                        <span className="text-xs font-mono text-yellow-500 font-bold">
                                            +{quest.reward}
                                        </span>

                                        {!isDone && (
                                            <a
                                                href={quest.actionLink}
                                                target={quest.actionLink.startsWith("http") ? "_blank" : "_self"}
                                                onClick={() => handleClaim(quest.id)} // Auto-claim on click for now (User Experience First)
                                                className="flex items-center gap-2 px-3 py-1.5 bg-white/5 hover:bg-white/10 rounded-lg text-xs font-bold text-white transition-colors"
                                            >
                                                Start <ExternalLink size={10} />
                                            </a>
                                        )}
                                    </div>
                                </div>
                            </div>
                        </div>
                    );
                })}
            </div>

            {/* Footer Alert */}
            <div className="mt-4 pt-4 border-t border-white/5 text-center">
                <p className="text-[10px] text-gray-500">
                    Rewards are distributed automatically upon verification.
                </p>
            </div>
        </div>
    );
}
