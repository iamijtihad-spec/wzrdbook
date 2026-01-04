"use client";

import { useGritState } from "@/components/GritStateProvider";
import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { TrendingUp, TrendingDown, RefreshCw, Zap, DollarSign } from "lucide-react";
import { BONDING_CURVE } from "@/lib/market";

export function BondingTerm() {
    const {
        marketState,
        buyGrit,
        sellGrit,
        solBalance,
        gritBalance,
        walletAddress
    } = useGritState();

    const [action, setAction] = useState<"buy" | "sell">("buy");
    const [amount, setAmount] = useState<string>("");
    const [quote, setQuote] = useState<number>(0);
    const [loading, setLoading] = useState(false);

    // Calculate quote on amount change
    useEffect(() => {
        const val = parseFloat(amount);
        if (isNaN(val) || val <= 0) {
            setQuote(0);
            return;
        }

        if (action === "buy") {
            // How much GRIT for X SOL?
            // This simulation logic mimics the Provider's approximation
            const S = marketState.currentSupply;
            const m = marketState.slope;
            const X = val;
            const gritOut = Math.sqrt((2 * X) / m + Math.pow(S, 2)) - S;
            setQuote(gritOut);
        } else {
            // How much SOL for X GRIT?
            const solOut = BONDING_CURVE.getSellPrice(marketState.currentSupply, val);
            setQuote(solOut);
        }
    }, [amount, action, marketState]);

    const handleExecute = async () => {
        if (!amount || parseFloat(amount) <= 0) return;
        setLoading(true);
        try {
            if (action === "buy") {
                await buyGrit(parseFloat(amount));
            } else {
                await sellGrit(parseFloat(amount));
            }
            setAmount("");
        } catch (e) {
            console.error(e);
            alert("Transaction Failed");
        } finally {
            setLoading(false);
        }
    };

    const price = marketState.currentPrice;

    return (
        <div className="w-full max-w-4xl mx-auto p-1 bg-[#1a1a1a] border border-[#333]">
            <div className="bg-[#0f0f0f] p-8 relative overflow-hidden min-h-[500px] flex gap-8">

                {/* Left: Visualization (Mock Chart) */}
                <div className="flex-1 border-r border-[#333] pr-8 flex flex-col">
                    <div className="mb-6">
                        <h3 className="text-[#d4af37] font-serif text-2xl flex items-center gap-2">
                            <TrendingUp className="w-5 h-5" /> MARKET DEPTH
                        </h3>
                        <div className="text-[#555] text-xs uppercase tracking-widest mt-1">Linear Bonding Curve (k=Constant)</div>
                    </div>

                    <div className="flex-1 relative bg-[#111] border border-[#333] p-4 flex items-end justify-center overflow-hidden group">
                        {/* Grid */}
                        <div className="absolute inset-0 bg-[linear-gradient(to_right,#222_1px,transparent_1px),linear-gradient(to_bottom,#222_1px,transparent_1px)] bg-[size:20px_20px] opacity-20" />

                        {/* Curve Line */}
                        <svg className="absolute inset-0 w-full h-full pointer-events-none" preserveAspectRatio="none">
                            <path d="M0,500 C200,450 400,300 600,0" stroke="#d4af37" strokeWidth="2" fill="none" className="opacity-50" />
                        </svg>

                        {/* Current Position Marker */}
                        <div className="absolute bottom-[30%] left-[50%] w-3 h-3 bg-[#d4af37] rounded-full shadow-[0_0_20px_#d4af37] animate-pulse z-10" />

                        <div className="z-10 text-center mb-8">
                            <div className="text-4xl font-mono text-white font-bold">{price.toFixed(6)} <span className="text-xs text-[#555] align-top">SOL/GRIT</span></div>
                            <div className="text-[#d4af37] text-xs font-mono mt-1">SUPPLY: {(marketState.currentSupply / 1_000_000).toFixed(2)}M</div>
                        </div>
                    </div>
                </div>

                {/* Right: Trade Terminal */}
                <div className="w-80 flex flex-col justify-center">
                    <div className="mb-8 flex border border-[#333] bg-[#1a1a1a]">
                        <button
                            onClick={() => setAction("buy")}
                            className={`flex-1 py-3 text-sm font-bold uppercase tracking-widest transition-colors ${action === "buy" ? "bg-[#d4af37] text-black" : "text-[#555] hover:text-[#d4af37]"}`}
                        >
                            <div className="flex items-center justify-center gap-2"><Zap className="w-4 h-4" /> Buy</div>
                        </button>
                        <button
                            onClick={() => setAction("sell")}
                            className={`flex-1 py-3 text-sm font-bold uppercase tracking-widest transition-colors ${action === "sell" ? "bg-[#d4af37] text-black" : "text-[#555] hover:text-[#d4af37]"}`}
                        >
                            <div className="flex items-center justify-center gap-2"><DollarSign className="w-4 h-4" /> Sell</div>
                        </button>
                    </div>

                    <div className="space-y-6">
                        <div>
                            <div className="flex justify-between text-xs text-[#555] mb-2 uppercase tracking-widest">
                                <span>{action === "buy" ? "Spend (SOL)" : "Sell (GRIT)"}</span>
                                <span>Bal: {(action === "buy" ? solBalance : gritBalance).toLocaleString()}</span>
                            </div>
                            <div className="relative">
                                <input
                                    type="number"
                                    value={amount}
                                    onChange={(e) => setAmount(e.target.value)}
                                    placeholder="0.00"
                                    className="w-full bg-[#111] border border-[#333] p-4 text-white font-mono text-xl focus:outline-none focus:border-[#d4af37] transition-colors"
                                />
                                <button className="absolute right-4 top-1/2 -translate-y-1/2 text-[#d4af37] text-xs font-bold hover:text-white" onClick={() => setAmount((action === "buy" ? solBalance : gritBalance).toString())}>MAX</button>
                            </div>
                        </div>

                        <div className="bg-[#1a1a1a] p-4 border border-[#333]">
                            <div className="flex justify-between text-xs text-[#555] mb-1 uppercase tracking-widest">Est. Output</div>
                            <div className="text-xl text-[#d4af37] font-mono font-bold text-right">
                                {quote.toLocaleString(undefined, { maximumFractionDigits: 4 })} <span className="text-xs text-[#888]">{action === "buy" ? "GRIT" : "SOL"}</span>
                            </div>
                        </div>

                        <button
                            onClick={handleExecute}
                            disabled={loading || !amount || parseFloat(amount) <= 0}
                            className="w-full py-5 bg-[#1a1a1a] border border-[#d4af37] text-[#d4af37] font-bold uppercase tracking-[0.2em] hover:bg-[#d4af37] hover:text-black transition-all disabled:opacity-50 disabled:cursor-not-allowed group relative overflow-hidden"
                        >
                            {loading ? <RefreshCw className="w-5 h-5 animate-spin mx-auto" /> : (action === "buy" ? "INITIATE SWAP" : "LIQUIDATE POSITION")}
                            <div className="absolute inset-0 bg-white/20 translate-x-[-100%] group-hover:translate-x-[100%] transition-transform duration-700" />
                        </button>
                    </div>
                </div>

            </div>
        </div>
    );
}
