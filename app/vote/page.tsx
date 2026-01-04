"use client";

import { useAnchorWallet, useConnection } from "@solana/wallet-adapter-react";
import { useState, useEffect } from "react";
import { Vote, Users, Plus, Check, X, ShieldCheck, Mic2, Music2, Activity, Volume2, VolumeX, Radio } from "lucide-react";
import { AnchorProvider, setProvider, web3, BN } from "@coral-xyz/anchor";
import { getGovProgram } from "@/lib/solana-client";
import Navigation from "@/components/Navigation";
import { motion } from "framer-motion";
import { useGritState } from "@/components/GritStateProvider";

const STEMS = [
    { id: 'vox1', label: 'Lead Vox', icon: Mic2, color: 'text-pink-400', bg: 'bg-pink-500/10' },
    { id: 'inout', label: 'In/Out', icon: Activity, color: 'text-cyan-400', bg: 'bg-cyan-500/10' },
    { id: 'adlibs', label: 'Adlibs', icon: Radio, color: 'text-yellow-400', bg: 'bg-yellow-500/10' },
    { id: 'bgvox', label: 'BG Vox', icon: Users, color: 'text-purple-400', bg: 'bg-purple-500/10' },
    { id: 'inst', label: 'Instrumental', icon: Music2, color: 'text-blue-400', bg: 'bg-blue-500/10' },
];

export default function GovernancePage() {
    const wallet = useAnchorWallet();
    const { connection } = useConnection();
    const { isPlaying, resonance, resonanceRank } = useGritState(); // Governance now checks Resonance Rank

    const [proposals, setProposals] = useState<any[]>([]);
    const [loading, setLoading] = useState(false);

    // Strict Governance State
    const [selectedStem, setSelectedStem] = useState(STEMS[0]);
    const [selectedAction, setSelectedAction] = useState<'amplify' | 'dampen'>('amplify');

    // Dynamic Cost Logic
    const BASE_COST = 0.01;
    const LISTENER_COST = 0.002;
    const currentCost = isPlaying ? LISTENER_COST : BASE_COST;

    // Rank Gating Logic
    const CAN_PROPOSE = resonanceRank !== "Initiate";
    const CAN_VOTE = resonanceRank !== "Initiate";

    useEffect(() => {
        if (!wallet || !connection) return;
        fetchProposals();
        const interval = setInterval(fetchProposals, 10000); // 10s polling
        return () => clearInterval(interval);
    }, [wallet, connection]);

    const fetchProposals = async () => {
        try {
            if (!wallet) return;
            const provider = new AnchorProvider(connection, wallet, {});
            setProvider(provider);
            const program = getGovProgram(provider);
            const allAndPks = await program.account.proposal.all();

            // Map to UI format
            const uiProposals = allAndPks.map(p => ({
                publicKey: p.publicKey,
                account: p.account as any // cast for speed
            }));

            setProposals(uiProposals);
        } catch (e) {
            console.error("Fetch proposals failed:", e);
        }
    };

    const handleCreate = async () => {
        if (!wallet) return alert("Connect wallet!");
        if (!CAN_PROPOSE) return alert(`Resonance Rank too low. You are an "${resonanceRank}". Reach "Signal" rank by listening to music to propose changes.`);

        setLoading(true);

        // Auto-Generate Title & Desc for strict structure
        const title = `[${selectedStem.label.toUpperCase()}] ${selectedAction.toUpperCase()}`;
        const desc = `Community proposal to ${selectedAction.toUpperCase()} the ${selectedStem.label} stem. ${selectedAction === 'amplify' ? 'Restores volume to 100%.' : 'Reduces volume to 30%.'}`;

        try {
            const provider = new AnchorProvider(connection, wallet, {});
            const program = getGovProgram(provider);

            const proposalKp = web3.Keypair.generate();

            await program.methods.createProposal(title, desc)
                .accounts({
                    proposal: proposalKp.publicKey,
                    author: wallet.publicKey,
                    systemProgram: web3.SystemProgram.programId,
                })
                .signers([proposalKp])
                .rpc();

            alert("Proposal Created!");
            fetchProposals();
        } catch (e) {
            console.error(e);
            alert("Failed: " + e);
        } finally {
            setLoading(false);
        }
    };

    const handleVote = async (proposalPk: web3.PublicKey, approve: boolean) => {
        if (!wallet) return alert("Connect wallet!");
        if (!CAN_VOTE) return alert(`Resonance Rank too low. You are an "${resonanceRank}". Reach "Signal" rank by listening to music to vote.`);

        try {
            const provider = new AnchorProvider(connection, wallet, {});
            const program = getGovProgram(provider);

            const voteRecord = web3.Keypair.generate();

            await program.methods.castVote(new BN(0), approve)
                .accounts({
                    proposal: proposalPk,
                    voteRecord: voteRecord.publicKey,
                    voter: wallet.publicKey,
                    systemProgram: web3.SystemProgram.programId
                })
                .signers([voteRecord])
                .rpc();

            alert(`Voted ${approve ? "YES" : "NO"}!`);
            fetchProposals();
        } catch (e) {
            console.error(e);
            alert("Vote failed: " + e);
        }
    };

    return (
        <div className="min-h-screen bg-black text-white selection:bg-indigo-500/30 font-sans">
            <Navigation />

            <main className="max-w-6xl mx-auto p-4 md:p-8 pt-24">
                <header className="mb-12 relative z-10">
                    <div className="flex items-center gap-3 mb-2">
                        <div className="p-2 rounded-lg bg-indigo-500/20 text-indigo-400">
                            <ShieldCheck className="w-6 h-6" />
                        </div>
                        <span className="text-indigo-400 text-xs font-bold tracking-widest uppercase">Sovereignty Protocol</span>
                    </div>
                    <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
                        <div>
                            <h1 className="text-4xl md:text-5xl font-black tracking-tighter uppercase text-white">
                                Mix <span className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-400 to-purple-400">Consensus</span>
                            </h1>
                            <p className="text-gray-400 max-w-2xl mt-4 leading-relaxed">
                                Govern the audio experience. Control individual stems via community consensus.
                            </p>
                        </div>
                        <div className="text-right">
                            <div className="inline-flex flex-col items-end">
                                <span className="text-[10px] uppercase font-bold text-gray-500 tracking-widest mb-1">Your Resonance</span>
                                <div className="flex items-center gap-2 text-xl font-black text-white">
                                    <span className={resonanceRank === 'Initiate' ? 'text-gray-500' : 'text-indigo-400'}>{resonance.toFixed(2)} Hz</span>
                                    <span className={`text-[10px] px-2 py-0.5 rounded border uppercase tracking-wider ${resonanceRank === 'Ether' ? 'border-purple-500 text-purple-400 bg-purple-500/10' :
                                        resonanceRank === 'Resonant' ? 'border-cyan-500 text-cyan-400 bg-cyan-500/10' :
                                            resonanceRank === 'Signal' ? 'border-green-500 text-green-400 bg-green-500/10' :
                                                'border-gray-700 text-gray-500 bg-gray-800'
                                        }`}>{resonanceRank}</span>
                                </div>
                            </div>
                        </div>
                    </div>
                </header>

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                    {/* LEFT: CREATE PROPOSAL (MIXING CONSOLE) */}
                    <div className="lg:col-span-1">
                        <div className="glass-panel p-6 rounded-3xl border border-white/5 bg-white/5 sticky top-24">
                            <h3 className="text-lg font-bold text-white mb-6 flex items-center gap-2">
                                <Plus className="w-5 h-5 text-indigo-400" />
                                Initiate Mix Shift
                            </h3>

                            <div className="space-y-6">
                                {/* STEP 1: SELECT STEM */}
                                <div>
                                    <label className="text-xs uppercase font-bold text-gray-500 mb-3 block tracking-wider">Target Stem</label>
                                    <div className="grid grid-cols-2 gap-2">
                                        {STEMS.map((stem) => (
                                            <button
                                                key={stem.id}
                                                onClick={() => setSelectedStem(stem)}
                                                className={`p-3 rounded-xl border flex items-center gap-2 text-sm font-bold transition-all ${selectedStem.id === stem.id
                                                    ? `border-${stem.color.split('-')[1]}-500 ${stem.bg} text-white`
                                                    : 'border-white/5 bg-black/20 text-gray-400 hover:bg-white/5'
                                                    }`}
                                            >
                                                <stem.icon className={`w-4 h-4 ${selectedStem.id === stem.id ? stem.color : 'text-gray-500'}`} />
                                                {stem.label}
                                            </button>
                                        ))}
                                    </div>
                                </div>

                                {/* STEP 2: SELECT ACTION */}
                                <div>
                                    <label className="text-xs uppercase font-bold text-gray-500 mb-3 block tracking-wider">Proposed Action</label>
                                    <div className="flex gap-2">
                                        <button
                                            onClick={() => setSelectedAction('amplify')}
                                            className={`flex-1 p-4 rounded-xl border flex flex-col items-center gap-2 transition-all ${selectedAction === 'amplify'
                                                ? 'border-green-500/50 bg-green-500/10 text-white'
                                                : 'border-white/5 bg-black/20 text-gray-400'
                                                }`}
                                        >
                                            <Volume2 className={selectedAction === 'amplify' ? 'text-green-400' : ''} />
                                            <span className="font-bold text-sm">AMPLIFY</span>
                                            <span className="text-[10px] opacity-60">100% Vol</span>
                                        </button>
                                        <button
                                            onClick={() => setSelectedAction('dampen')}
                                            className={`flex-1 p-4 rounded-xl border flex flex-col items-center gap-2 transition-all ${selectedAction === 'dampen'
                                                ? 'border-red-500/50 bg-red-500/10 text-white'
                                                : 'border-white/5 bg-black/20 text-gray-400'
                                                }`}
                                        >
                                            <VolumeX className={selectedAction === 'dampen' ? 'text-red-400' : ''} />
                                            <span className="font-bold text-sm">DAMPEN</span>
                                            <span className="text-[10px] opacity-60">30% Vol</span>
                                        </button>
                                    </div>
                                </div>

                                {/* SUBMIT */}
                                <button
                                    onClick={handleCreate}
                                    disabled={loading || !wallet}
                                    className="w-full bg-indigo-600 hover:bg-indigo-500 text-white font-bold py-4 rounded-xl disabled:opacity-50 disabled:cursor-not-allowed transition-all shadow-lg shadow-indigo-900/20 active:scale-95 flex items-center justify-center gap-2"
                                >
                                    {loading ? (
                                        <span className="animate-pulse">Broadcasting...</span>
                                    ) : (
                                        <>
                                            Initiate Vote
                                            <span className={`text-xs font-mono px-2 py-0.5 rounded ml-1 border ${isPlaying
                                                ? "bg-green-500/20 text-green-300 border-green-500/30"
                                                : "bg-indigo-700/50 text-indigo-200 border-transparent"
                                                }`}>
                                                {currentCost} SOL
                                            </span>
                                        </>
                                    )}
                                </button>

                                {isPlaying && (
                                    <p className="text-[10px] text-center text-green-400 font-mono animate-pulse">
                                        ⚡ Listener Discount Active
                                    </p>
                                )}
                                {!wallet && (
                                    <p className="text-xs text-center text-red-400 font-mono">Wallet connection required</p>
                                )}
                            </div>
                        </div>
                    </div>

                    {/* RIGHT: PROPOSALS LIST */}
                    <div className="lg:col-span-2 space-y-6">
                        {proposals.length === 0 ? (
                            <div className="flex flex-col items-center justify-center py-20 border border-dashed border-white/10 rounded-3xl bg-white/5">
                                <Vote className="w-12 h-12 text-gray-600 mb-4" />
                                <p className="text-gray-400 font-medium">No active mix proposals.</p>
                            </div>
                        ) : (
                            proposals.map((item) => {
                                const p = item.account;
                                const total = p.votesFor.toNumber() + p.votesAgainst.toNumber();
                                const yesPercent = total === 0 ? 0 : Math.round((p.votesFor.toNumber() / total) * 100);
                                const noPercent = total === 0 ? 0 : Math.round((p.votesAgainst.toNumber() / total) * 100);

                                return (
                                    <motion.div
                                        initial={{ opacity: 0, y: 20 }}
                                        animate={{ opacity: 1, y: 0 }}
                                        key={item.publicKey.toString()}
                                        className="glass-panel p-6 md:p-8 rounded-3xl border border-white/5 bg-black/40 hover:bg-white/5 transition-colors group"
                                    >
                                        <div className="flex flex-col md:flex-row md:items-start justify-between mb-8 gap-4">
                                            <div>
                                                <h3 className="text-2xl font-bold text-white mb-2 leading-tight group-hover:text-indigo-300 transition-colors">{p.title}</h3>
                                                <p className="text-gray-400 leading-relaxed max-w-xl">{p.description}</p>
                                            </div>
                                            <div className="shrink-0">
                                                <div className="inline-flex items-center gap-2 bg-green-500/10 text-green-400 px-3 py-1.5 rounded-full text-xs font-bold border border-green-500/20 uppercase tracking-wider">
                                                    <span className="w-1.5 h-1.5 rounded-full bg-green-500 animate-pulse" />
                                                    Active
                                                </div>
                                            </div>
                                        </div>

                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-8">
                                            <div className="bg-white/5 p-4 rounded-2xl border border-white/5">
                                                <div className="flex justify-between text-sm mb-2">
                                                    <span className="font-bold text-green-400 flex items-center gap-2"><Check className="w-4 h-4" /> YES</span>
                                                    <span className="text-gray-400 font-mono">{yesPercent}%</span>
                                                </div>
                                                <div className="h-3 bg-black/50 rounded-full overflow-hidden mb-2">
                                                    <div className="h-full bg-gradient-to-r from-green-500 to-emerald-400 transition-all duration-1000 ease-out" style={{ width: `${yesPercent}%` }}></div>
                                                </div>
                                                <p className="text-right text-xs text-gray-500 font-mono">{p.votesFor.toString()} Votes</p>
                                            </div>

                                            <div className="bg-white/5 p-4 rounded-2xl border border-white/5">
                                                <div className="flex justify-between text-sm mb-2">
                                                    <span className="font-bold text-red-400 flex items-center gap-2"><X className="w-4 h-4" /> NO</span>
                                                    <span className="text-gray-400 font-mono">{noPercent}%</span>
                                                </div>
                                                <div className="h-3 bg-black/50 rounded-full overflow-hidden mb-2">
                                                    <div className="h-full bg-gradient-to-r from-red-500 to-orange-400 transition-all duration-1000 ease-out" style={{ width: `${noPercent}%` }}></div>
                                                </div>
                                                <p className="text-right text-xs text-gray-500 font-mono">{p.votesAgainst.toString()} Votes</p>
                                            </div>
                                        </div>

                                        <div className="flex flex-col sm:flex-row gap-4 pt-6 border-t border-white/5">
                                            <button
                                                onClick={() => handleVote(item.publicKey, true)}
                                                className="flex-1 py-3 px-6 rounded-xl bg-gray-800 hover:bg-green-500 hover:text-black hover:border-green-400 text-white font-bold transition-all border border-white/5 flex items-center justify-center gap-2"
                                            >
                                                <Check className="w-4 h-4" /> Vote For
                                            </button>
                                            <button
                                                onClick={() => handleVote(item.publicKey, false)}
                                                className="flex-1 py-3 px-6 rounded-xl bg-gray-800 hover:bg-red-500 hover:text-black hover:border-red-400 text-white font-bold transition-all border border-white/5 flex items-center justify-center gap-2"
                                            >
                                                <X className="w-4 h-4" /> Vote Against
                                            </button>
                                        </div>

                                        <div className="mt-4 flex justify-between items-center">
                                            <div className="flex items-center gap-2 text-xs text-gray-500 font-mono">
                                                <Users className="w-3 h-3" />
                                                {total} Total Votes
                                            </div>
                                            <div className="text-[10px] text-gray-600 font-mono uppercase tracking-widest">
                                                ID: {item.publicKey.toString().slice(0, 8)}...
                                            </div>
                                        </div>
                                    </motion.div>
                                );
                            })
                        )}
                    </div>
                </div>
            </main>
        </div >
    );
}
