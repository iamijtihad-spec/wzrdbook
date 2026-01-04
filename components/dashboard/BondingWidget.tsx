"use client";

import { useEffect, useState } from "react";
import { TrendingUp, ArrowRight } from "lucide-react";
import Link from "next/link";
import { useAnchorWallet, useConnection } from "@solana/wallet-adapter-react";
import { AnchorProvider } from "@coral-xyz/anchor";
import { getBondingProgram } from "@/lib/solana-client";
import { getAccountInfoRaw } from "@/lib/raw-solana";
import { PublicKey } from "@solana/web3.js";
import bondingConfig from "@/lib/bonding-config.json";

export default function BondingWidget() {
    const wallet = useAnchorWallet();
    const { connection } = useConnection();
    const [price, setPrice] = useState<number | null>(null);

    useEffect(() => {
        if (!wallet) return;
        const fetchPrice = async () => {
            try {
                const provider = new AnchorProvider(connection, wallet, {});
                const program = getBondingProgram(provider);
                const curveConfigPubkey = new PublicKey(bondingConfig.curveConfig);

                // Raw Fetch to bypass StructError
                const accountInfo = await getAccountInfoRaw(connection, curveConfigPubkey);

                if (accountInfo) {
                    const acc = program.coder.accounts.decode("CurveConfig", accountInfo.data);

                    const supply = acc.totalSupply.toNumber();
                    const base = acc.basePrice.toNumber();
                    const slope = acc.slope.toNumber();
                    const priceLamports = base + (slope * supply);
                    setPrice(priceLamports / 1_000_000_000);
                }
            } catch (e) {
                console.error("Widget Bonding Error", e);
            }
        };
        fetchPrice();
        const i = setInterval(fetchPrice, 10000);
        return () => clearInterval(i);
    }, [wallet, connection]);

    return (
        <div className="glass-panel p-5 rounded-2xl border border-white/5 hover:border-orange-500/30 transition-colors group">
            <div className="flex justify-between items-center mb-4">
                <div className="flex items-center gap-2">
                    <div className="bg-orange-500/20 p-2 rounded-lg text-orange-400">
                        <TrendingUp size={18} />
                    </div>
                    <h3 className="font-bold text-white">Live Curve</h3>
                </div>
                <span className="text-xs text-green-400 font-mono animate-pulse">● Live</span>
            </div>

            <div className="mb-4">
                <p className="text-gray-400 text-xs uppercase tracking-wider mb-1">Current Price</p>
                <div className="text-3xl font-black text-white font-mono">
                    {price ? `${price.toFixed(6)} SOL` : "Loading..."}
                </div>
            </div>

            <Link href="/bonding" className="flex items-center justify-between w-full py-3 px-4 bg-orange-600/10 hover:bg-orange-600/20 rounded-xl border border-orange-500/30 text-orange-400 transition-all font-bold text-sm">
                <span>Trade GRIT</span>
                <ArrowRight size={16} className="group-hover:translate-x-1 transition-transform" />
            </Link>
        </div>
    );
}
