"use client";

import { useState, useEffect } from "react";
import Navigation from "@/components/Navigation";
import { useAnchorWallet, useConnection } from "@solana/wallet-adapter-react";
import { Shield, ShieldAlert, Send, Upload, Activity, Lock, Unlock, Save, Check, X, Clock as WaitIcon, Trash2, LayoutDashboard, Database, HardDrive, FileText } from "lucide-react";
import ringsConfig from "@/config/rings.json";
import { useGritState } from "@/components/GritStateProvider";

// Components
import { PayrollLedger } from "@/components/admin/PayrollLedger";
import { RewardsLedger } from "@/components/admin/RewardsLedger";
import { ActionLedger } from "@/components/admin/ActionLedger";
import { AirdropControl } from "@/components/admin/AirdropControl";
import { DeploymentProtocol } from "@/components/admin/DeploymentProtocol";

const ADMIN_PASS = "369Infinity!";

export default function AdminPage() {
    const { connection } = useConnection();
    const wallet = useAnchorWallet();
    const { recentActivity } = useGritState();

    const [password, setPassword] = useState("");
    const [isAuthenticated, setIsAuthenticated] = useState(false);
    const [filter, setFilter] = useState("OVERVIEW"); // OVERVIEW, DISCORD, DOMAINS, TRANSMISSIONS

    // Ring State (Legacy kept for file uploads)
    const [rings, setRings] = useState(ringsConfig.rings);
    const [selectedRing, setSelectedRing] = useState<any>(null);
    const [uploadForm, setUploadForm] = useState({ title: "", artist: "", duration: "" });
    const [selectedFile, setSelectedFile] = useState<File | null>(null);
    const [loading, setLoading] = useState(false);

    const handleLogin = () => {
        if (password === ADMIN_PASS) setIsAuthenticated(true);
        else {
            alert("Incorrect Access Code");
            setPassword("");
        }
    };

    const handleAirdrop = async (recipient: string, amount: string, token: string) => {
        try {
            const res = await fetch('/api/admin/airdrop', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ recipient, amount, token })
            });
            const data = await res.json();
            alert(data.success ? "Airdrop Successful!" : "Failed: " + data.error);
        } catch (e) {
            alert("Error executing airdrop.");
        }
    };

    const handleUploadContent = async () => {
        if (!selectedRing || !selectedFile) return alert("Select a file.");
        setLoading(true);

        const formData = new FormData();
        formData.append("ringId", selectedRing.id);
        formData.append("title", uploadForm.title);
        formData.append("artist", uploadForm.artist);
        formData.append("duration", uploadForm.duration);
        formData.append("file", selectedFile);

        try {
            const res = await fetch('/api/admin/rings/upload', {
                method: 'POST',
                body: formData
            });

            if (res.ok) alert("Upload Successful. R2 Sync Complete.");
            else alert("Upload Failed.");
        } catch (e) {
            console.error(e);
            alert("Upload Error");
        } finally {
            setLoading(false);
            setUploadForm({ title: "", artist: "", duration: "" });
            setSelectedFile(null);
        }
    };

    if (!isAuthenticated) {
        return (
            <div className="min-h-screen bg-black text-white font-sans flex items-center justify-center bg-[url('/noise.png')]">
                <div className="bg-white/5 border border-white/10 p-8 rounded-2xl w-full max-w-md backdrop-blur-xl text-center space-y-6 shadow-2xl">
                    <div className="w-16 h-16 bg-white/10 rounded-full flex items-center justify-center mx-auto ring-1 ring-white/20">
                        <Shield className="text-white" size={32} />
                    </div>
                    <div>
                        <h1 className="text-2xl font-bold tracking-widest uppercase">Admin Command</h1>
                        <p className="text-gray-500 text-sm mt-2">Restricted Access // 369 Clearance</p>
                    </div>
                    <div className="relative">
                        <Lock className="absolute left-4 top-3.5 text-gray-500" size={16} />
                        <input
                            type="password"
                            placeholder="Access Code"
                            className="w-full bg-black/50 border border-white/10 rounded-xl py-3 pl-12 pr-4 text-center tracking-[0.5em] focus:border-white/30 outline-none transition-all"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            onKeyDown={(e) => e.key === 'Enter' && handleLogin()}
                        />
                    </div>
                    <button
                        onClick={handleLogin}
                        className="w-full py-3 bg-white text-black font-bold rounded-xl hover:bg-gray-200 transition-transform active:scale-95 shadow-[0_0_20px_rgba(255,255,255,0.1)]"
                    >
                        INITIALIZE SESSION
                    </button>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-black text-white font-sans selection:bg-purple-500/30">
            <Navigation />
            <div className="fixed inset-0 bg-[url('/noise.png')] opacity-10 pointer-events-none z-0" />

            <main className="relative z-10 max-w-7xl mx-auto p-6 pt-24">

                {/* Header */}
                <div className="flex flex-col md:flex-row justify-between items-end mb-12 border-b border-white/10 pb-6 animate-fade-in-down">
                    <div>
                        <h1 className="text-4xl md:text-5xl font-black tracking-tighter mb-2 flex items-center gap-3">
                            <LayoutDashboard className="text-gray-400" size={40} />
                            ADMIN <span className="text-transparent bg-clip-text bg-gradient-to-r from-purple-400 to-blue-500">NUCLEUS</span>
                        </h1>
                        <p className="text-gray-500 font-mono text-sm tracking-widest uppercase">
                            System Status: <span className="text-green-500 animate-pulse">OPTIMAL</span> • Latency: 12ms
                        </p>
                    </div>
                    <div className="flex gap-2 bg-white/5 p-1 rounded-xl glass-panel mt-4 md:mt-0 overflow-x-auto">
                        {[
                            { id: "OVERVIEW", icon: LayoutDashboard, label: "Overview" },
                            { id: "OBLIGATIONS", icon: Check, label: "Rituals" },
                            { id: "DISCORD", icon: Database, label: "Discord" },
                            { id: "DOMAINS", icon: HardDrive, label: "Firewall" },
                            { id: "TRANSMISSIONS", icon: Upload, label: "Transmissions" }
                        ].map((tab) => (
                            <button
                                key={tab.id}
                                onClick={() => setFilter(tab.id)}
                                className={`px-4 py-2 rounded-lg flex items-center gap-2 text-sm font-bold transition-all whitespace-nowrap ${filter === tab.id
                                    ? 'bg-white text-black shadow-lg'
                                    : 'text-gray-500 hover:text-white hover:bg-white/5'
                                    }`}
                            >
                                <tab.icon size={16} /> {tab.label}
                            </button>
                        ))}
                    </div>
                </div>

                {/* OVERVIEW VIEW */}
                {filter === "OVERVIEW" && (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 animate-fade-in-up">
                        <div className="lg:col-span-2">
                            <div className="bg-gradient-to-br from-indigo-900/20 to-purple-900/20 p-6 rounded-2xl border border-indigo-500/30 mb-6">
                                <h3 className="text-xl font-bold text-white mb-2">Protocol Health</h3>
                                <div className="grid grid-cols-3 gap-4 mt-4 text-center">
                                    <div className="bg-black/30 p-4 rounded-xl">
                                        <p className="text-gray-400 text-xs uppercase mb-1">Active Users</p>
                                        <p className="text-2xl font-mono text-white">8,421</p>
                                    </div>
                                    <div className="bg-black/30 p-4 rounded-xl">
                                        <p className="text-gray-400 text-xs uppercase mb-1">GRIT Staked</p>
                                        <p className="text-2xl font-mono text-indigo-400">12.4M</p>
                                    </div>
                                    <div className="bg-black/30 p-4 rounded-xl">
                                        <p className="text-gray-400 text-xs uppercase mb-1">Total Burned</p>
                                        <p className="text-2xl font-mono text-red-500">442K</p>
                                    </div>
                                </div>
                            </div>
                            <AirdropControl onAirdrop={handleAirdrop} />
                        </div>
                        <div className="lg:col-span-1 h-full">
                            <ActionLedger />
                        </div>
                    </div>
                )}

                {/* OBLIGATIONS (WEEKLY RITUALS) */}
                {filter === "OBLIGATIONS" && (
                    <div className="grid md:grid-cols-2 gap-6 animate-fade-in-up">
                        <div className="glass-panel p-6 rounded-2xl border border-white/10">
                            <h2 className="text-2xl font-bold mb-6 flex items-center gap-2 text-yellow-500">
                                <Activity /> Weekly Obligations
                            </h2>
                            <p className="text-gray-500 text-sm mb-6">Mandatory maintenance rituals to sustain the protocol.</p>

                            <div className="space-y-3">
                                {[
                                    { label: "Check Resonance Decay", status: "pending" },
                                    { label: "Update Bonding Curve Parameters", status: "complete" },
                                    { label: "Review Flagged Transmissions", status: "pending" },
                                    { label: "Sync Discord Role Mappings", status: "pending" }
                                ].map((task, i) => (
                                    <div key={i} className="flex items-center justify-between p-4 bg-white/5 rounded-xl border border-white/5 hover:border-white/20 transition-all cursor-pointer group">
                                        <div className="flex items-center gap-3">
                                            <div className={`w-5 h-5 rounded border flex items-center justify-center ${task.status === 'complete' ? 'bg-green-500 border-green-500' : 'border-gray-600 group-hover:border-white'}`}>
                                                {task.status === 'complete' && <Check size={14} className="text-black" />}
                                            </div>
                                            <span className={task.status === 'complete' ? 'text-gray-500 line-through' : 'text-gray-200'}>{task.label}</span>
                                        </div>
                                        <div className={`text-[10px] uppercase font-bold px-2 py-1 rounded ${task.status === 'complete' ? 'bg-green-900/30 text-green-400' : 'bg-yellow-900/30 text-yellow-400'}`}>
                                            {task.status}
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>

                        <div className="glass-panel p-6 rounded-2xl border border-white/10">
                            <h2 className="text-2xl font-bold mb-6 flex items-center gap-2 text-red-500">
                                <ShieldAlert /> Critical Alerts
                            </h2>
                            <div className="bg-red-900/10 border border-red-500/20 p-4 rounded-xl mb-4">
                                <h4 className="font-bold text-red-400 mb-1">Low Liquidity Detected</h4>
                                <p className="text-xs text-red-200/70">The Bonding Curve via Heritage is showing signs of stagnation. Consider an Epoch Injection.</p>
                            </div>
                        </div>
                    </div>
                )}

                {/* DISCORD VIEW */}
                {filter === "DISCORD" && (
                    <div className="glass-panel p-6 rounded-2xl border border-white/10 animate-fade-in-up space-y-6">
                        <div>
                            <h2 className="text-2xl font-bold mb-2 flex items-center gap-2 text-indigo-400">
                                <Database size={24} /> Neural Interface (Discord)
                            </h2>
                            <p className="text-gray-500 text-sm">Manage the connection between the Dashboard and the Discord server.</p>
                        </div>

                        <div className="grid md:grid-cols-3 gap-6">
                            <div className="bg-white/5 p-6 rounded-xl border border-white/5 hover:border-indigo-500/50 transition-colors">
                                <h3 className="font-bold text-lg mb-2">Deploy Architecture</h3>
                                <p className="text-xs text-gray-500 mb-4 h-10">Constructs the channel hierarchy: Sovereign, Ascesis, Heritage, Market.</p>
                                <button
                                    onClick={async () => {
                                        const btn = document.activeElement as HTMLButtonElement;
                                        if (btn) btn.disabled = true;
                                        try {
                                            const res = await fetch('/api/admin/deploy-discord', { method: 'POST' });
                                            const data = await res.json();
                                            alert(data.success ? "Deployment Successful!" : "Failed: " + data.error);
                                        } catch (e) {
                                            alert("Connection Error");
                                        }
                                        if (btn) btn.disabled = false;
                                    }}
                                    className="w-full py-2 bg-indigo-600 hover:bg-indigo-500 disabled:bg-indigo-900 rounded-lg text-xs font-bold uppercase tracking-widest transition-colors"
                                >
                                    Deploy Channels
                                </button>
                            </div>

                            <div className="bg-white/5 p-6 rounded-xl border border-white/5 hover:border-indigo-500/50 transition-colors">
                                <h3 className="font-bold text-lg mb-2">Sync Access Roles</h3>
                                <p className="text-xs text-gray-500 mb-4 h-10">Updates Discord roles specifically based on user on-chain status.</p>
                                <button
                                    onClick={() => alert("Syncing Roles...")}
                                    className="w-full py-2 bg-gray-700 hover:bg-gray-600 rounded-lg text-xs font-bold uppercase tracking-widest transition-colors"
                                >
                                    Force Sync
                                </button>
                            </div>

                            <div className="bg-white/5 p-6 rounded-xl border border-white/5 hover:border-indigo-500/50 transition-colors">
                                <h3 className="font-bold text-lg mb-2">Bot Status</h3>
                                <div className="flex items-center gap-2 mb-4 h-10">
                                    <div className="w-3 h-3 bg-green-500 rounded-full animate-pulse"></div>
                                    <span className="text-sm font-mono text-green-400">ONLINE</span>
                                </div>
                                <button className="w-full py-2 bg-red-900/50 hover:bg-red-900 border border-red-500/30 rounded-lg text-xs font-bold uppercase tracking-widest transition-colors text-red-400">
                                    Reboot System
                                </button>
                            </div>
                        </div>
                    </div>
                )}

                {/* DOMAINS FIREWALL VIEW */}
                {filter === "DOMAINS" && (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6 animate-fade-in-up">
                        <div className="glass-panel p-6 rounded-2xl border border-white/10">
                            <h2 className="text-xl font-bold mb-4 text-red-500 flex items-center gap-2">
                                <Shield /> Domain Firewall
                            </h2>
                            <p className="text-gray-500 text-sm mb-6">Manage Access Control Lists (ACL) and Threat Levels.</p>

                            <div className="space-y-4">
                                <div className="flex items-center justify-between p-4 bg-red-900/10 border border-red-500/20 rounded-xl">
                                    <div>
                                        <h4 className="font-bold text-white">Global Lockdown</h4>
                                        <p className="text-xs text-red-300">Suspend all domain transitions immediately.</p>
                                    </div>
                                    <label className="relative inline-flex items-center cursor-pointer">
                                        <input type="checkbox" className="sr-only peer" />
                                        <div className="w-11 h-6 bg-gray-700 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-red-600"></div>
                                    </label>
                                </div>

                                <div className="bg-white/5 p-4 rounded-xl">
                                    <h4 className="font-bold text-gray-300 mb-3 text-sm uppercase tracking-widest">Active Gates</h4>
                                    <div className="space-y-2">
                                        {['ASCESIS (Burn)', 'HERITAGE (Time)', 'MARKET (Stake)'].map(gate => (
                                            <div key={gate} className="flex justify-between items-center text-sm p-2 hover:bg-white/5 rounded-lg">
                                                <span className="text-gray-400 font-mono">{gate}</span>
                                                <div className="flex items-center gap-2">
                                                    <span className="w-2 h-2 bg-green-500 rounded-full shadow-[0_0_10px_#22c55e]"></span>
                                                    <span className="text-xs text-green-400">ACTIVE</span>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            </div>
                        </div>
                        <RewardsLedger />
                    </div>
                )}

                {/* TRANSMISSIONS (The Signal) */}
                {filter === "TRANSMISSIONS" && (
                    <div className="glass-panel p-6 rounded-2xl border border-white/10 animate-fade-in-up">
                        <h2 className="text-2xl font-bold mb-6 flex items-center gap-2">
                            <Upload className="text-blue-500" /> Signal Injection
                        </h2>

                        <div className="grid md:grid-cols-2 gap-8">
                            <div className="space-y-4">
                                <label className="block text-xs uppercase text-gray-500 font-bold">Target Frequency</label>
                                <div className="grid grid-cols-2 gap-2">
                                    {rings.map(r => (
                                        <button
                                            key={r.id}
                                            onClick={() => setSelectedRing(r)}
                                            className={`p-3 rounded-lg text-left text-sm font-mono border transition-all ${selectedRing?.id === r.id
                                                ? 'bg-blue-500/20 border-blue-500 text-blue-300'
                                                : 'bg-black/30 border-white/5 text-gray-500 hover:bg-white/5'
                                                }`}
                                        >
                                            {r.name}
                                        </button>
                                    ))}
                                </div>
                            </div>

                            <div className="space-y-4 bg-black/20 p-6 rounded-xl border border-white/5">
                                <h3 className="text-white font-bold mb-4 flex items-center gap-2"><Send size={16} /> Broadcast Payload</h3>

                                <div className="grid grid-cols-2 gap-4">
                                    <div className="col-span-2">
                                        <input
                                            type="text"
                                            placeholder="Signal Identifier (Title)"
                                            className="w-full bg-black border border-white/10 rounded-lg p-3 text-sm text-white focus:border-blue-500 outline-none"
                                            value={uploadForm.title}
                                            onChange={(e) => setUploadForm({ ...uploadForm, title: e.target.value })}
                                        />
                                    </div>
                                    <input
                                        type="text"
                                        placeholder="Origin (Artist)"
                                        className="w-full bg-black border border-white/10 rounded-lg p-3 text-sm text-white focus:border-blue-500 outline-none"
                                        value={uploadForm.artist}
                                        onChange={(e) => setUploadForm({ ...uploadForm, artist: e.target.value })}
                                    />
                                    <input
                                        type="text"
                                        placeholder="Duration (0:00)"
                                        className="w-full bg-black border border-white/10 rounded-lg p-3 text-sm text-white focus:border-blue-500 outline-none"
                                        value={uploadForm.duration}
                                        onChange={(e) => setUploadForm({ ...uploadForm, duration: e.target.value })}
                                    />
                                </div>

                                <div className="border-2 border-dashed border-white/10 rounded-xl p-8 text-center hover:border-blue-500/50 transition-colors cursor-pointer relative group">
                                    <input
                                        type="file"
                                        className="absolute inset-0 opacity-0 cursor-pointer"
                                        onChange={(e) => setSelectedFile(e.target.files?.[0] || null)}
                                    />
                                    <Upload className="mx-auto text-gray-500 mb-2 group-hover:text-blue-400 transition-colors" />
                                    <p className="text-sm text-gray-400">
                                        {selectedFile ? <span className="text-blue-400 font-bold">{selectedFile.name}</span> : "Drop Payload Artifact (MP3/WAV)"}
                                    </p>
                                </div>

                                <button
                                    onClick={handleUploadContent}
                                    disabled={loading || !selectedRing || !selectedFile}
                                    className={`w-full py-4 rounded-xl font-bold uppercase tracking-widest transition-all ${loading ? 'bg-gray-800' : 'bg-blue-600 hover:bg-blue-500 shadow-lg shadow-blue-900/30'
                                        }`}
                                >
                                    {loading ? "TRANSMITTING..." : "INITIATE BROADCAST"}
                                </button>
                            </div>
                        </div>
                    </div>
                )}
            </main>
        </div>
    );
}
