"use client";

import { useEffect, useState, useRef } from "react";
import { ActionLedger } from "@/components/admin/ActionLedger";
import { MessageSquare, Radio, Zap, Activity } from "lucide-react";
import Image from "next/image";
import Navigation from "@/components/Navigation";
import { motion } from "framer-motion";

interface ChatMessage {
    id: string;
    username: string;
    content: string;
    avatar: string; // URL
    channel: string; // e.g., 'lobby'
    timestamp: number;
}

export default function LivePage() {
    const [messages, setMessages] = useState<ChatMessage[]>([]);
    const bottomRef = useRef<HTMLDivElement>(null);

    // Poll for Chat Data
    useEffect(() => {
        const fetchChat = async () => {
            try {
                const res = await fetch("/api/chat");
                const data = await res.json();
                if (data.success) {
                    setMessages(data.messages);
                }
            } catch (e) {
                console.error("Chat Poll Error", e);
            }
        };

        fetchChat();
        const interval = setInterval(fetchChat, 3000); // 3s polling
        return () => clearInterval(interval);
    }, []);

    // Auto-scroll
    useEffect(() => {
        bottomRef.current?.scrollIntoView({ behavior: "smooth" });
    }, [messages]);

    return (
        <div className="min-h-screen bg-black text-white font-sans selection:bg-red-500/30">
            <Navigation />

            <main className="max-w-[1600px] mx-auto p-4 md:p-8 pt-24 h-screen flex flex-col">
                <header className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8 relative z-10 shrink-0">
                    <div>
                        <div className="flex items-center gap-3 mb-2">
                            <div className="w-2 h-2 rounded-full bg-red-500 animate-pulse shadow-[0_0_10px_red]" />
                            <span className="text-red-500 text-xs font-bold tracking-widest uppercase">Live Transmission</span>
                        </div>
                        <h1 className="text-4xl md:text-5xl font-black tracking-tighter uppercase text-white">
                            System <span className="text-transparent bg-clip-text bg-gradient-to-r from-red-500 to-orange-500">Feed</span>
                        </h1>
                    </div>
                </header>

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 flex-grow overflow-hidden pb-8">
                    {/* LEFT: ACTION LEDGER (2 cols) */}
                    <motion.div
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        className="lg:col-span-2 glass-panel border border-white/5 rounded-3xl overflow-hidden bg-black/40 flex flex-col shadow-2xl shadow-black/50"
                    >
                        <div className="p-6 border-b border-white/5 flex items-center justify-between bg-white/5">
                            <div className="flex items-center gap-2">
                                <Activity className="w-5 h-5 text-gray-400" />
                                <h3 className="font-bold text-gray-200 uppercase tracking-wider text-sm">Chain Events</h3>
                            </div>
                            <div className="flex gap-2">
                                <span className="w-2 h-2 rounded-full bg-green-500" />
                                <span className="w-2 h-2 rounded-full bg-yellow-500" />
                                <span className="w-2 h-2 rounded-full bg-red-500" />
                            </div>
                        </div>
                        <div className="flex-grow overflow-hidden relative">
                            <div className="absolute inset-0 p-4 overflow-y-auto custom-scrollbar">
                                <ActionLedger />
                            </div>
                        </div>
                    </motion.div>

                    {/* RIGHT: CHAT FEED (1 col) */}
                    <motion.div
                        initial={{ opacity: 0, x: 20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: 0.1 }}
                        className="glass-panel bg-black/40 border border-white/5 rounded-3xl flex flex-col relative overflow-hidden backdrop-blur-xl shadow-2xl shadow-black/50"
                    >
                        <div className="p-6 border-b border-white/5 flex items-center justify-between bg-white/5">
                            <div className="flex items-center gap-2">
                                <MessageSquare className="w-5 h-5 text-gray-400" />
                                <h3 className="font-bold text-gray-200 uppercase tracking-wider text-sm">Comms</h3>
                            </div>
                            <div className="px-2 py-0.5 rounded bg-green-500/20 text-green-400 text-[10px] font-bold uppercase tracking-widest border border-green-500/30">
                                Protected
                            </div>
                        </div>

                        <div className="flex-grow overflow-y-auto space-y-4 p-4 custom-scrollbar">
                            {messages.length === 0 ? (
                                <div className="flex flex-col items-center justify-center h-full text-gray-600 space-y-4">
                                    <div className="w-12 h-12 rounded-full border border-gray-800 flex items-center justify-center">
                                        <Radio className="w-6 h-6 animate-pulse" />
                                    </div>
                                    <p className="text-sm font-mono uppercase tracking-widest">Scanning Frequencies...</p>
                                </div>
                            ) : (
                                messages.map((msg, i) => (
                                    <motion.div
                                        initial={{ opacity: 0, y: 10 }}
                                        animate={{ opacity: 1, y: 0 }}
                                        key={i}
                                        className="flex gap-3 group p-3 rounded-xl hover:bg-white/5 transition-colors border border-transparent hover:border-white/5"
                                    >
                                        <div className="w-10 h-10 rounded-full overflow-hidden border border-white/10 shrink-0 bg-black">
                                            {msg.avatar ? (
                                                <Image src={msg.avatar} alt={msg.username} width={40} height={40} className="object-cover" />
                                            ) : (
                                                <div className="w-full h-full bg-gradient-to-br from-gray-800 to-black" />
                                            )}
                                        </div>
                                        <div className="flex-grow min-w-0">
                                            <div className="flex justify-between items-baseline mb-1">
                                                <span className="font-bold text-gray-200 text-sm truncate">{msg.username}</span>
                                                <span className="text-[10px] text-gray-600 uppercase tracking-widest bg-white/5 px-1.5 py-0.5 rounded ml-2">
                                                    #{msg.channel}
                                                </span>
                                            </div>
                                            <p className="text-gray-400 text-sm leading-relaxed whitespace-pre-wrap break-words">
                                                {msg.content}
                                            </p>
                                        </div>
                                    </motion.div>
                                ))
                            )}
                            <div ref={bottomRef} />
                        </div>
                    </motion.div>
                </div>
            </main>
        </div>
    );
}
