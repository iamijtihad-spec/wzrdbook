"use client";

import { useState, useEffect } from 'react';
import { useGritState } from "@/components/GritStateProvider";
import {
    Activity,
    Shield,
    Plus,
    Save,
    RotateCw,
    Database,
    Coins,
    Flame,
    Users,
    LayoutDashboard,
    Layers,
    Users2,
    ScrollText,
    Globe,
    ExternalLink,
    Zap,
    TrendingUp
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { ActionLedger } from './ActionLedger';

interface Stem {
    name: string;
    url: string; // R2 URL
    domain: string;
}

export default function ArtistConsole() {
    const { wzrdHandle } = useGritState();
    const [activeTab, setActiveTab] = useState<"overview" | "assets" | "ledger">("overview");
    const [stems, setStems] = useState<Stem[]>([]);
    const [stats, setStats] = useState<any>(null);
    const [loading, setLoading] = useState(true);
    const [statsLoading, setStatsLoading] = useState(true);
    const [isSaving, setIsSaving] = useState(false);
    const [showAddModal, setShowAddModal] = useState(false);

    // New Stem Form
    const [newStem, setNewStem] = useState<Stem>({ name: "", url: "", domain: "sovereign" });

    useEffect(() => {
        fetchConfig();
        fetchStats();
        const statsInterval = setInterval(fetchStats, 10000); // Poll stats every 10s
        return () => clearInterval(statsInterval);
    }, []);

    const fetchStats = async () => {
        try {
            const res = await fetch('/api/admin/stats');
            const data = await res.json();
            if (data.success) {
                setStats(data);
            }
        } catch (e) {
            console.error("Failed to fetch stats", e);
        } finally {
            setStatsLoading(false);
        }
    };

    const fetchConfig = async () => {
        setLoading(true);
        try {
            const res = await fetch('/api/admin/get-config');
            const data = await res.json();
            if (data.collection && data.collection[0]) {
                const loadedStems = data.collection[0].stems || [];
                const formatted = loadedStems.map((s: any) =>
                    typeof s === 'string' ? { name: s, url: "", domain: "sovereign" } : s
                );
                setStems(formatted);
            }
        } catch (e) {
            console.error("Failed to load config", e);
        } finally {
            setLoading(false);
        }
    };

    const updateDomain = (name: string, newDomain: string) => {
        setStems(stems.map(s => s.name === name ? { ...s, domain: newDomain } : s));
    };

    const updateUrl = (name: string, newUrl: string) => {
        setStems(stems.map(s => s.name === name ? { ...s, url: newUrl } : s));
    };

    const addNewStem = () => {
        if (!newStem.name) return;
        setStems([...stems, newStem]);
        setNewStem({ name: "", url: "", domain: "sovereign" });
        setShowAddModal(false);
    };

    const deleteStem = (name: string) => {
        setStems(stems.filter(s => s.name !== name));
    };

    const saveConfig = async () => {
        setIsSaving(true);
        try {
            await fetch('/api/admin/update-config', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ stems })
            });
            setTimeout(() => setIsSaving(false), 1000);
        } catch (e) {
            console.error(e);
            setIsSaving(false);
        }
    };

    const domains = ['sovereign', 'heritage', 'ascesis', 'glitch'];

    if (loading) return (
        <div className="min-h-screen bg-black flex items-center justify-center font-mono text-red-500 tracking-[0.2em] text-[10px] uppercase">
            <RotateCw className="animate-spin mr-3" size={14} />
            Initializing Neural Blueprint...
        </div>
    );

    return (
        <div className="p-8 md:p-12 max-w-7xl mx-auto font-mono text-[10px] text-white/50 uppercase tracking-widest bg-black min-h-screen">
            {/* Header */}
            <div className="flex flex-col md:flex-row justify-between items-start md:items-end mb-12 gap-8">
                <div>
                    <h1 className="text-4xl font-serif italic text-white lowercase tracking-tight mb-2">Nucleus of the Void</h1>
                    <div className="flex items-center gap-3">
                        <span className="w-2 h-2 bg-green-500 rounded-full animate-pulse" />
                        <p className="text-gray-400 text-xs tracking-widest uppercase">System Online: {wzrdHandle || "Artist"}</p>
                    </div>
                </div>

                {/* Tabs */}
                <div className="flex border border-white/10 p-1 bg-white/5 rounded-lg overflow-hidden backdrop-blur-md">
                    <TabButton active={activeTab === "overview"} label="Dashboard" onClick={() => setActiveTab("overview")} icon={<LayoutDashboard size={14} />} />
                    <TabButton active={activeTab === "assets"} label="Assets" onClick={() => setActiveTab("assets")} icon={<Layers size={14} />} />
                    <TabButton active={activeTab === "ledger"} label="Events" onClick={() => setActiveTab("ledger")} icon={<ScrollText size={14} />} />
                </div>
            </div>

            {/* Metrics Bar */}
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4 mb-12">
                <MetricCard
                    label="Treasury Pool"
                    value={`${stats?.treasurySol?.toFixed(2) || "0.00"} SOL`}
                    icon={<Globe className="text-blue-400" />}
                    subtext="Mainnet Reserve"
                />
                <MetricCard
                    label="Grit Supply"
                    value={(stats?.gritSupply || 0).toLocaleString()}
                    icon={<Coins className="text-amber-400" />}
                    subtext="Bonding Curve Circ."
                />
                <MetricCard
                    label="Identified Souls"
                    value={stats?.totalUsers || "0"}
                    icon={<Users2 className="text-green-400" />}
                    subtext="Total Registered"
                />
                <MetricCard
                    label="Token Holders"
                    value={stats?.totalHolders || "0"}
                    icon={<Shield className="text-blue-500" />}
                    subtext="Unique Wallets"
                />
                <MetricCard
                    label="Cosmic Creatures"
                    value={stats?.totalNFTs || "0"}
                    icon={<Zap className="text-purple-400" />}
                    subtext="Active Evolutions"
                />
                <MetricCard
                    label="Total Scars"
                    value={stats?.totalScars || "0"}
                    icon={<Flame className="text-red-500" />}
                    subtext="Sacrificial Index"
                />
            </div>

            {/* Main Content Areas */}
            <AnimatePresence mode="wait">
                {activeTab === "overview" && (
                    <motion.div
                        key="overview"
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -10 }}
                        className="grid grid-cols-1 lg:grid-cols-3 gap-8 h-full"
                    >
                        {/* System Health Area */}
                        <div className="lg:col-span-2 space-y-8">
                            <div className="glass-panel p-8 border border-white/10 rounded-2xl bg-gradient-to-br from-white/5 to-transparent">
                                <h3 className="text-lg text-white font-bold mb-6 flex items-center gap-2">
                                    <TrendingUp className="text-green-400" size={18} /> Ecosystem Pulse
                                </h3>
                                <div className="grid grid-cols-2 gap-8">
                                    <div className="space-y-4">
                                        <div className="flex justify-between text-gray-500">
                                            <span>Evolutionary Depth</span>
                                            <span className="text-white">LVL {stats?.avgCreatureLevel || 0} AVG</span>
                                        </div>
                                        <div className="h-1 w-full bg-white/5 rounded-full overflow-hidden">
                                            <motion.div
                                                className="h-full bg-purple-500 shadow-[0_0_10px_rgba(168,85,247,0.5)]"
                                                animate={{ width: `${(stats?.avgCreatureLevel || 1) * 2}%` }}
                                            />
                                        </div>
                                    </div>
                                    <div className="space-y-4">
                                        <div className="flex justify-between text-gray-500">
                                            <span>Sacrificial Heat</span>
                                            <span className="text-white">{(stats?.totalScars || 0) * 10}% Intensity</span>
                                        </div>
                                        <div className="h-1 w-full bg-white/5 rounded-full overflow-hidden">
                                            <motion.div
                                                className="h-full bg-red-500 shadow-[0_0_10px_rgba(239,68,68,0.5)]"
                                                animate={{ width: `${Math.min(100, (stats?.totalScars || 0) * 10)}%` }}
                                            />
                                        </div>
                                    </div>
                                </div>
                            </div>

                            <div className="space-y-4">
                                <h3 className="text-[10px] text-gray-500 font-black tracking-widest uppercase">Live Activity History</h3>
                                <div className="space-y-2 max-h-[400px] overflow-y-auto scrollbar-hide pr-2">
                                    {(stats?.recentTransactions || []).map((tx: any, i: number) => (
                                        <div key={i} className="flex items-center justify-between p-4 bg-white/5 border border-white/5 rounded-xl hover:border-white/10 transition-colors">
                                            <div className="flex items-center gap-4">
                                                <div className={`p-2 rounded-lg ${tx.type === 'burn' ? 'bg-red-500/20 text-red-500' : 'bg-blue-500/20 text-blue-400'}`}>
                                                    {tx.type === 'burn' ? <Flame size={14} /> : <Activity size={14} />}
                                                </div>
                                                <div>
                                                    <div className="text-white font-bold text-[11px] uppercase">{tx.type}</div>
                                                    <div className="text-gray-500 text-[9px]">{tx.description}</div>
                                                </div>
                                            </div>
                                            <div className="text-right">
                                                <div className="text-gray-400 text-[9px] font-mono">{new Date(tx.timestamp).toLocaleTimeString()}</div>
                                                <div className="text-gray-600 text-[8px] uppercase">{tx.actor}</div>
                                            </div>
                                        </div>
                                    ))}
                                    {(!stats?.recentTransactions || stats.recentTransactions.length === 0) && (
                                        <div className="text-center py-12 text-gray-600 italic">No recent pulses detected.</div>
                                    )}
                                </div>
                            </div>
                        </div>

                        {/* Quick Actions Panel */}
                        <div className="space-y-6">
                            <div className="glass-panel p-6 border border-white/10 flex flex-col items-center justify-center space-y-4 text-center">
                                <Shield className="text-white/20" size={48} />
                                <h4 className="text-white font-bold tracking-widest text-[12px]">RAPID DEPLOYMENT</h4>
                                <p className="text-[9px] text-gray-500">Authorized personnel only. Triggering these events will broadcast to all connected souls.</p>
                                <button className="w-full py-3 bg-red-900/20 border border-red-500/50 text-red-500 hover:bg-red-500 hover:text-white transition-all font-black uppercase text-[10px]">
                                    EMERGENCY FREEZE
                                </button>
                                <button className="w-full py-3 bg-blue-900/20 border border-blue-500/50 text-blue-400 hover:bg-blue-500 hover:text-white transition-all font-black uppercase text-[10px]">
                                    MASS AIRDROP
                                </button>
                            </div>

                            <a
                                href="https://explorer.solana.com/address/88vks8S3j3KvzL177fGisxU5FvH5Ais7hT3xYJ2B1B1f?cluster=mainnet-beta"
                                target="_blank"
                                rel="noopener noreferrer"
                                className="bg-white/5 border border-white/5 p-4 rounded-xl flex items-center justify-between group cursor-pointer hover:border-white/20 block"
                            >
                                <div className="flex items-center gap-3">
                                    <ExternalLink size={14} className="text-gray-500 group-hover:text-amber-400 transition-colors" />
                                    <span className="text-[9px] group-hover:text-white transition-colors">TREASURY EXPLORER</span>
                                </div>
                                <span className="text-[8px] text-gray-600">VERIFY CHAIN</span>
                            </a>
                        </div>
                    </motion.div>
                )}

                {activeTab === "assets" && (
                    <motion.div
                        key="assets"
                        initial={{ opacity: 0, x: 20 }}
                        animate={{ opacity: 1, x: 0 }}
                        exit={{ opacity: 0, x: -20 }}
                        className="space-y-12"
                    >
                        <div className="flex justify-between items-center bg-white/5 p-6 border border-white/10 rounded-2xl">
                            <div>
                                <h2 className="text-xl font-bold text-white mb-2">Asset Architecture</h2>
                                <p className="text-xs text-gray-500">Define the stems and their domain resonance.</p>
                            </div>
                            <div className="flex gap-4">
                                <button onClick={() => setShowAddModal(true)} className="px-6 py-3 border border-white/20 hover:border-white transition-colors flex items-center gap-2">
                                    <Plus size={14} /> Add Stem
                                </button>
                                <button onClick={saveConfig} disabled={isSaving} className="px-10 py-3 bg-white text-black font-bold hover:bg-transparent hover:text-white border border-white transition-all disabled:opacity-50">
                                    {isSaving ? "Instantiating..." : "Instantiate"}
                                </button>
                            </div>
                        </div>

                        <div className="grid md:grid-cols-4 gap-6 h-[50vh]">
                            {domains.map((domain) => (
                                <div key={domain} className="abstract-panel p-6 border border-white/10 flex flex-col bg-white/5 rounded-2xl" onDragOver={(e) => e.preventDefault()} onDrop={(e) => {
                                    const name = e.dataTransfer.getData("stemName");
                                    updateDomain(name, domain);
                                }}>
                                    <h2 className="mb-6 text-white/50 text-[9px] uppercase border-b border-white/10 pb-2 flex justify-between font-black tracking-widest">
                                        {domain}
                                        <span className="opacity-30">{stems.filter(s => s.domain === domain).length}</span>
                                    </h2>
                                    <div className="flex-1 space-y-4 overflow-y-auto scrollbar-hide">
                                        {stems.filter(s => s.domain === domain).map((stem) => (
                                            <motion.div layoutId={stem.name} key={stem.name} draggable onDragStart={(e: any) => e.dataTransfer.setData("stemName", stem.name)} className="p-4 bg-black border border-white/10 hover:border-white/50 transition-all group relative flex flex-col gap-2 rounded-xl">
                                                <div className='flex justify-between items-center'>
                                                    <span className="text-white text-[11px] font-black">{stem.name}</span>
                                                    <button onClick={() => deleteStem(stem.name)} className='text-red-500 hover:text-red-400 opacity-0 group-hover:opacity-100 transition-opacity text-base'>×</button>
                                                </div>
                                                <input type="text" placeholder="R2 URL..." value={stem.url} onChange={(e) => updateUrl(stem.name, e.target.value)} className="bg-white/5 border border-white/5 text-[8px] p-2 text-white w-full outline-none focus:border-white/20 rounded-md" />
                                            </motion.div>
                                        ))}
                                    </div>
                                </div>
                            ))}
                        </div>
                    </motion.div>
                )}

                {activeTab === "ledger" && (
                    <motion.div
                        key="ledger"
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className="h-[70vh]"
                    >
                        <ActionLedger />
                    </motion.div>
                )}
            </AnimatePresence>

            {/* Modal */}
            {showAddModal && (
                <div className="fixed inset-0 bg-black/80 flex items-center justify-center z-50 backdrop-blur-md">
                    <div className="bg-black border border-white/10 p-8 w-96 space-y-6 rounded-2xl shadow-2xl">
                        <h3 className="text-white text-lg font-bold">Add New Stem</h3>
                        <div className="space-y-4">
                            <input className="w-full bg-white/5 border border-white/10 p-4 text-white outline-none rounded-xl" placeholder="Name" value={newStem.name} onChange={e => setNewStem({ ...newStem, name: e.target.value })} />
                            <input className="w-full bg-white/5 border border-white/10 p-4 text-white outline-none rounded-xl" placeholder="URL" value={newStem.url} onChange={e => setNewStem({ ...newStem, url: e.target.value })} />
                            <select className="w-full bg-white/5 border border-white/10 p-4 text-white outline-none rounded-xl uppercase font-mono text-[10px]" value={newStem.domain} onChange={e => setNewStem({ ...newStem, domain: e.target.value })}>
                                {domains.map(d => <option key={d} value={d}>{d}</option>)}
                            </select>
                        </div>
                        <div className="flex gap-4 justify-end pt-4">
                            <button onClick={() => setShowAddModal(false)} className="px-6 py-3 text-white/50 hover:text-white uppercase text-[10px]">Cancel</button>
                            <button onClick={addNewStem} className="px-8 py-3 bg-white text-black font-black hover:bg-white/90 rounded-xl text-[10px] uppercase">Add</button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}

function MetricCard({ label, value, icon, subtext }: any) {
    return (
        <div className="glass-panel p-6 border border-white/10 rounded-2xl bg-white/5 relative overflow-hidden group hover:border-white/20 transition-all">
            <div className="absolute top-0 right-0 p-4 opacity-20 group-hover:opacity-40 group-hover:scale-110 transition-all">
                {icon}
            </div>
            <div className="relative z-10">
                <span className="text-gray-500 font-bold mb-2 block">{label}</span>
                <div className="text-2xl font-black text-white tracking-widest">{value}</div>
                <div className="text-[8px] text-gray-600 mt-2 font-mono uppercase tracking-[0.2em]">{subtext}</div>
            </div>
            <div className="absolute bottom-0 left-0 h-1 w-0 bg-white group-hover:w-full transition-all duration-500" />
        </div>
    );
}

function TabButton({ active, label, onClick, icon }: any) {
    return (
        <button
            onClick={onClick}
            className={`
                px-6 py-3 flex items-center gap-2 transition-all font-black text-[9px] uppercase tracking-widest
                ${active ? "bg-white text-black font-black" : "text-gray-500 hover:text-white hover:bg-white/5"}
            `}
        >
            {icon}
            {label}
        </button>
    );
}
