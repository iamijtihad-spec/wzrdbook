'use client';

import React from 'react';
import { Mail, MessageSquare, ShieldCheck, ExternalLink } from 'lucide-react';
import { motion } from 'framer-motion';

export default function ContactPage() {
    return (
        <div className="min-h-screen bg-black text-white p-6 md:p-12 font-sans selection:bg-cyan-500/20">
            <div className="max-w-4xl mx-auto space-y-16">

                {/* Header Section */}
                <div className="space-y-6 text-center">
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.6 }}
                    >
                        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/5 border border-white/10 text-xs font-mono tracking-widest uppercase text-cyan-400 mb-6">
                            <span className="w-1.5 h-1.5 rounded-full bg-cyan-400 animate-pulse" />
                            Signal Transmission
                        </div>
                        <h1 className="text-4xl md:text-6xl font-light tracking-tight text-white/90">
                            Client <span className="text-white/40">Support</span>
                        </h1>
                        <p className="max-w-xl mx-auto mt-6 text-lg text-white/40 leading-relaxed">
                            Initiate a secure line for inquiries, technical assistance, or partnership proposals.
                        </p>
                    </motion.div>
                </div>

                {/* Support Channels */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">

                    {/* Direct Line */}
                    <motion.div
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ duration: 0.6, delay: 0.2 }}
                        className="group relative p-8 rounded-3xl bg-neutral-900/50 border border-white/5 backdrop-blur-xl overflow-hidden hover:border-cyan-500/30 transition-colors"
                    >
                        <div className="absolute top-0 right-0 p-8 opacity-10 group-hover:opacity-20 transition-opacity">
                            <Mail className="w-24 h-24 text-cyan-500" />
                        </div>

                        <div className="relative z-10 space-y-6">
                            <div className="w-12 h-12 rounded-2xl bg-cyan-500/10 flex items-center justify-center border border-cyan-500/20">
                                <Mail className="w-6 h-6 text-cyan-400" />
                            </div>

                            <div>
                                <h3 className="text-xl font-medium text-white/90">Direct Comms</h3>
                                <p className="mt-2 text-white/40 text-sm">Priority channel for account issues and billing.</p>
                            </div>

                            <div className="pt-4">
                                <a
                                    href="mailto:creator@wzrdbook.com"
                                    className="inline-flex items-center gap-3 px-6 py-3 rounded-xl bg-white text-black font-medium hover:bg-cyan-400 transition-colors"
                                >
                                    <span>Open Ticket via Email</span>
                                    <ExternalLink className="w-4 h-4" />
                                </a>
                            </div>
                        </div>
                    </motion.div>

                    {/* Community/FAQ */}
                    <motion.div
                        initial={{ opacity: 0, x: 20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ duration: 0.6, delay: 0.3 }}
                        className="group relative p-8 rounded-3xl bg-neutral-900/50 border border-white/5 backdrop-blur-xl overflow-hidden hover:border-purple-500/30 transition-colors"
                    >
                        <div className="absolute top-0 right-0 p-8 opacity-10 group-hover:opacity-20 transition-opacity">
                            <MessageSquare className="w-24 h-24 text-purple-500" />
                        </div>

                        <div className="relative z-10 space-y-6">
                            <div className="w-12 h-12 rounded-2xl bg-purple-500/10 flex items-center justify-center border border-purple-500/20">
                                <ShieldCheck className="w-6 h-6 text-purple-400" />
                            </div>

                            <div>
                                <h3 className="text-xl font-medium text-white/90">Security & FAQ</h3>
                                <p className="mt-2 text-white/40 text-sm">Common protocols and security verification.</p>
                            </div>

                            <ul className="space-y-3 pt-2">
                                <li className="flex items-start gap-3 text-sm text-white/60">
                                    <span className="w-1.5 h-1.5 rounded-full bg-purple-500 mt-2" />
                                    Funds are secured via Cloudflare D1 & Stripe.
                                </li>
                                <li className="flex items-start gap-3 text-sm text-white/60">
                                    <span className="w-1.5 h-1.5 rounded-full bg-purple-500 mt-2" />
                                    Use "The Vault" for all withdrawal requests.
                                </li>
                            </ul>
                        </div>
                    </motion.div>

                </div>

                {/* Footer info */}
                <div className="text-center pt-8 border-t border-white/5">
                    <p className="text-white/20 text-xs font-mono uppercase tracking-widest">
                        System Status: Operational • v2.4.0
                    </p>
                </div>

            </div>
        </div>
    );
}
