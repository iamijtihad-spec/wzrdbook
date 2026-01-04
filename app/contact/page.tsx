"use client";

import { motion } from "framer-motion";
import { Mail, MessageSquare, Shield, Clock } from "lucide-react";
import Link from "next/link";

export default function ContactPage() {
    return (
        <div className="min-h-screen pt-24 px-4 pb-12 relative overflow-hidden bg-[#0a0a0a]">
            {/* Background Ambience */}
            <div className="fixed inset-0 pointer-events-none">
                <div className="absolute top-[-20%] left-[-10%] w-[600px] h-[600px] bg-amber-900/10 blur-[120px]" />
                <div className="absolute bottom-[-20%] right-[-10%] w-[600px] h-[600px] bg-blue-900/10 blur-[120px]" />
            </div>

            <div className="max-w-4xl mx-auto relative z-10">
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="text-center mb-16"
                >
                    <h1 className="text-4xl md:text-6xl font-black text-white tracking-tighter mb-4">
                        SIGNAL <span className="text-[#d4af37]">TRANSMISSION</span>
                    </h1>
                    <p className="text-gray-500 font-mono uppercase tracking-widest text-sm">
                        Protocol Support / Channel 01 / Secure Line
                    </p>
                </motion.div>

                <div className="grid md:grid-cols-2 gap-8">
                    {/* Primary Contact Method */}
                    <motion.div
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: 0.1 }}
                        className="bg-[#111] border border-white/10 p-8 rounded-2xl relative overflow-hidden group hover:border-[#d4af37]/50 transition-colors"
                    >
                        <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:opacity-20 transition-opacity">
                            <Mail className="w-24 h-24 text-white" />
                        </div>

                        <div className="relative z-10">
                            <div className="w-12 h-12 bg-[#d4af37]/10 flex items-center justify-center rounded-lg mb-6 text-[#d4af37]">
                                <Mail className="w-6 h-6" />
                            </div>
                            <h3 className="text-2xl font-bold text-white mb-2">Direct Uplink</h3>
                            <p className="text-gray-400 mb-8 leading-relaxed">
                                For urgent protocol errors, banking disputes, or collaboration requests.
                            </p>

                            <div className="bg-black/50 p-4 rounded-lg border border-white/5 mb-6">
                                <code className="text-[#d4af37] font-mono">creator@wzrdbook.com</code>
                            </div>

                            <a
                                href="mailto:creator@wzrdbook.com?subject=Protocol%20Transmission"
                                className="inline-flex items-center gap-2 bg-[#d4af37] text-black font-bold uppercase tracking-wider py-3 px-6 rounded-lg hover:bg-white transition-colors"
                            >
                                <Mail className="w-4 h-4" /> Open Encrypted Channel
                            </a>
                        </div>
                    </motion.div>

                    {/* Info / FAQ */}
                    <div className="space-y-6">
                        <motion.div
                            initial={{ opacity: 0, x: 20 }}
                            animate={{ opacity: 1, x: 0 }}
                            transition={{ delay: 0.2 }}
                            className="bg-[#111] border border-white/10 p-6 rounded-xl flex gap-4 items-start"
                        >
                            <div className="bg-blue-500/10 p-3 rounded-lg text-blue-400 shrink-0">
                                <Clock className="w-6 h-6" />
                            </div>
                            <div>
                                <h4 className="text-white font-bold mb-1">Response Time</h4>
                                <p className="text-gray-400 text-sm">Transmissions are processed in the order received. Expect a response time of 24-48 hours depending on network congestion.</p>
                            </div>
                        </motion.div>

                        <motion.div
                            initial={{ opacity: 0, x: 20 }}
                            animate={{ opacity: 1, x: 0 }}
                            transition={{ delay: 0.3 }}
                            className="bg-[#111] border border-white/10 p-6 rounded-xl flex gap-4 items-start"
                        >
                            <div className="bg-green-500/10 p-3 rounded-lg text-green-400 shrink-0">
                                <Shield className="w-6 h-6" />
                            </div>
                            <div>
                                <h4 className="text-white font-bold mb-1">Security Protocol</h4>
                                <p className="text-gray-400 text-sm">Do not include private keys or banking passwords in your transmission. Staff will never ask for your seed phrase.</p>
                            </div>
                        </motion.div>

                        <motion.div
                            initial={{ opacity: 0, x: 20 }}
                            animate={{ opacity: 1, x: 0 }}
                            transition={{ delay: 0.4 }}
                            className="bg-[#111] border border-white/10 p-6 rounded-xl flex gap-4 items-start"
                        >
                            <div className="bg-purple-500/10 p-3 rounded-lg text-purple-400 shrink-0">
                                <MessageSquare className="w-6 h-6" />
                            </div>
                            <div>
                                <h4 className="text-white font-bold mb-1">Feedback</h4>
                                <p className="text-gray-400 text-sm">Feature requests for the Neo-Bank interface are welcome. We are constantly evolving.</p>
                            </div>
                        </motion.div>
                    </div>
                </div>

                <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: 0.6 }}
                    className="mt-16 text-center"
                >
                    <Link href="/" className="text-gray-600 hover:text-white transition-colors text-sm font-mono uppercase tracking-widest">
                        ← Return to Dashboard
                    </Link>
                </motion.div>
            </div>
        </div>
    );
}
