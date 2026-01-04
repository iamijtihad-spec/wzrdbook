"use client";

import { useWallet } from "@solana/wallet-adapter-react";
import { useGritState } from "@/components/GritStateProvider";
import { useState } from "react";
import { Send, CheckCircle, Video, Users, Share2 } from "lucide-react";
import PrivateKeyLogin from "@/components/PrivateKeyLogin";
import Script from "next/script";
import Navigation from "@/components/Navigation";
import GlassGate from "@/components/GlassGate";

interface Bounty {
    id: string;
    title: string;
    description: string;
    reward: number;
    platform: "tiktok" | "twitter" | "instagram";
}

const BOUNTIES: Bounty[] = [
    {
        id: "1",
        title: "Villian Strut Challenge",
        description: "Create a TikTok using the official 'Villian Strut' sound. Must include #GRITCOIN tag.",
        reward: 500,
        platform: "tiktok"
    },
    {
        id: "2",
        title: "Show Your Merch",
        description: "Post a video wearing any GRIT phygital merch. Tap the NFC chip on camera.",
        reward: 10,
        platform: "tiktok"
    },
    {
        id: "3",
        title: "Tweet Your Dashboard",
        description: "Share a screenshot of your GRIT dashboard showing your balance.",
        reward: 250,
        platform: "twitter"
    }
];

export default function BountyBoardPage() {
    const { connected, publicKey } = useWallet();
    const { gritBalance } = useGritState();

    // Submission State
    const [activeBounty, setActiveBounty] = useState<string | null>(null);
    const [proofLink, setProofLink] = useState("");
    const [submitting, setSubmitting] = useState(false);
    const [submitted, setSubmitted] = useState<string[]>([]); // Track submitted IDs

    const handleSubmit = async (bountyId: string) => {
        if (!proofLink || !publicKey) return;
        setSubmitting(true);

        const bounty = BOUNTIES.find(b => b.id === bountyId);
        if (!bounty) {
            alert("Bounty not found.");
            setSubmitting(false);
            return;
        }

        try {
            const res = await fetch('/api/bounties/submit', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    wallet: publicKey.toBase58(),
                    link: proofLink,
                    platform: bounty.platform,
                    bountyId: bounty.id
                })
            });

            const data = await res.json();

            if (data.success) {
                setSubmitted(prev => [...prev, bountyId]);
                alert("Submission Received! Payout will occur after manual verification (~24h).");
            } else {
                alert(`Submission Failed: ${data.message || "Link invalid or other error."}`);
            }
        } catch (error) {
            console.error("Submission error:", error);
            alert("An unexpected error occurred during submission.");
        } finally {
            setSubmitting(false);
            setActiveBounty(null);
            setProofLink("");
        }
    };

    return (
        <div className="min-h-screen p-4 md:p-8 pb-32">
            <Navigation />
            <div className="mt-20"></div>

            <header className="flex flex-col md:flex-row justify-between items-center mb-12 gap-4">
                <div>
                    <h1 className="text-4xl font-black italic bg-gradient-to-r from-yellow-400 to-orange-500 bg-clip-text text-transparent uppercase">
                        Digital Street Team
                    </h1>
                    <p className="text-gray-400 mt-2">Complete tasks. Earn CHI. Own the network.</p>
                </div>
                {!connected && <PrivateKeyLogin />}
                {!connected && <PrivateKeyLogin />}
            </header>

            {/* QUICK ACTIONS (INSTANT EARN) */}
            <GlassGate>
                <div className="grid md:grid-cols-2 gap-6 mb-12">
                    <div onClick={() => window.open("https://discord.gg/grit", "_blank")} className="bg-[#5865F2]/20 border border-[#5865F2]/50 p-6 rounded-2xl flex items-center gap-4 cursor-pointer hover:bg-[#5865F2]/30 transition-all group">
                        <div className="p-3 bg-[#5865F2] rounded-xl text-white">
                            <Users size={24} />
                        </div>
                        <div>
                            <h3 className="font-bold text-white group-hover:text-[#5865F2] transition-colors">Join Discord</h3>
                            <p className="text-[#5865F2]-300 text-sm">Instant +50 CHI</p>
                        </div>
                    </div>

                    <div onClick={() => window.open("https://twitter.com/grit_coin", "_blank")} className="bg-[#1DA1F2]/20 border border-[#1DA1F2]/50 p-6 rounded-2xl flex items-center gap-4 cursor-pointer hover:bg-[#1DA1F2]/30 transition-all group">
                        <div className="p-3 bg-[#1DA1F2] rounded-xl text-white">
                            <Share2 size={24} />
                        </div>
                        <div>
                            <h3 className="font-bold text-white group-hover:text-[#1DA1F2] transition-colors">Follow on X</h3>
                            <p className="text-[#1DA1F2]-300 text-sm">Instant +50 CHI</p>
                        </div>
                    </div>
                </div>

                <div className="grid md:grid-cols-3 gap-6">
                    {BOUNTIES.map((bounty) => {
                        const isCompleted = submitted.includes(bounty.id);
                        const isActive = activeBounty === bounty.id;

                        return (
                            <div key={bounty.id} className={`bg-gray-800/30 border ${isActive ? 'border-yellow-500' : 'border-gray-700'} rounded-2xl p-6 transition-all hover:bg-gray-800/50`}>
                                <div className="flex justify-between items-start mb-4">
                                    <div className="p-3 bg-gray-900 rounded-xl">
                                        {bounty.platform === "tiktok" ? <Video className="text-pink-500" /> : <Share2 className="text-blue-400" />}
                                    </div>
                                    <span className="bg-yellow-900/30 text-yellow-500 text-xs font-bold px-3 py-1 rounded-full border border-yellow-500/30">
                                        +{bounty.reward} CHI
                                    </span>
                                </div>

                                <h3 className="text-xl font-bold text-white mb-2">{bounty.title}</h3>
                                <p className="text-gray-400 text-sm mb-6">{bounty.description}</p>

                                {isCompleted ? (
                                    <div className="w-full py-3 bg-green-900/20 border border-green-500/30 text-green-400 rounded-xl flex items-center justify-center gap-2 font-bold">
                                        <CheckCircle size={16} /> Submitted
                                    </div>
                                ) : isActive ? (
                                    <div className="space-y-3 animate-in fade-in slide-in-from-top-2">
                                        <input
                                            type="text"
                                            placeholder={`Paste ${bounty.platform} link...`}
                                            value={proofLink}
                                            onChange={(e) => setProofLink(e.target.value)}
                                            className="w-full bg-black/50 border border-gray-600 rounded-lg p-3 text-white text-sm focus:border-yellow-500 outline-none"
                                        />
                                        <div className="flex gap-2">
                                            <button
                                                onClick={() => setActiveBounty(null)}
                                                className="px-4 py-2 bg-gray-700 hover:bg-gray-600 rounded-lg text-white text-sm"
                                            >
                                                Cancel
                                            </button>
                                            <button
                                                onClick={() => handleSubmit(bounty.id)}
                                                disabled={!proofLink || submitting}
                                                className="flex-1 py-2 bg-yellow-600 hover:bg-yellow-500 rounded-lg text-black font-bold text-sm disabled:opacity-50"
                                            >
                                                {submitting ? "Verifying..." : "Submit Proof"}
                                            </button>
                                        </div>
                                    </div>
                                ) : (
                                    <button
                                        onClick={() => setActiveBounty(bounty.id)}
                                        disabled={!connected}
                                        className="w-full py-3 bg-gray-700 hover:bg-gray-600 border border-gray-600 hover:border-white text-white rounded-xl font-bold transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                                    >
                                        {connected ? "Start Task" : "Connect Wallet to Earn"}
                                    </button>
                                )}
                            </div>
                        );
                    })}
                </div>

                {/* WidgetBot Embed handled globally by DiscordComms */}

                <div className="mt-12 p-8 bg-[#5865F2]/10 rounded-3xl border border-[#5865F2]/30 text-center relative overflow-hidden">
                    <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-[#5865F2] to-purple-500" />
                    <Users className="w-12 h-12 text-[#5865F2] mx-auto mb-4" />
                    <h3 className="text-xl font-bold text-white mb-2">Real-Time Referral System</h3>
                    <p className="text-gray-400 mb-6 max-w-xl mx-auto">
                        We use a live Discord integration to track authentic community growth.
                        <br />
                        Click the <span className="text-[#5865F2] font-bold">Discord Button</span> in the bottom right corner to generate your unique invite link.
                    </p>
                    <div className="flex justify-center gap-4">
                        <button onClick={() => window.open("https://discord.gg/5rRjx9cuvv", "_blank")} className="bg-[#5865F2] text-white font-bold px-6 py-3 rounded-xl hover:bg-[#5865F2]/80 transition-all flex items-center gap-2">
                            <Share2 size={18} />
                            Join Server
                        </button>
                        <button className="bg-black border border-gray-700 text-gray-400 font-bold px-6 py-3 rounded-xl hover:text-white transition-all">
                            View Leaderboard
                        </button>
                    </div>
                </div>
            </GlassGate>
        </div>
    );
}
