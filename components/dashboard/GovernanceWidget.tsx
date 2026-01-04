"use client";

import { useEffect, useState } from "react";
import { Vote, ArrowRight, CheckCircle2 } from "lucide-react";
import Link from "next/link";
import { useAnchorWallet, useConnection } from "@solana/wallet-adapter-react";
import { AnchorProvider } from "@coral-xyz/anchor";
import { getGovProgram } from "@/lib/solana-client";
import { getProgramAccountsRaw } from "@/lib/raw-solana";

export default function GovernanceWidget() {
    const wallet = useAnchorWallet();
    const { connection } = useConnection();
    const [activeCount, setActiveCount] = useState<number>(0);
    const [latestProposal, setLatestProposal] = useState<string | null>(null);

    useEffect(() => {
        if (!wallet) return;
        const fetchGov = async () => {
            try {
                const provider = new AnchorProvider(connection, wallet, {});
                const program = getGovProgram(provider);

                // Raw fetch to bypass StructError
                const accounts = await getProgramAccountsRaw(connection, program.programId);
                const props = accounts.map((acc: any) => {
                    try {
                        return program.coder.accounts.decode("Proposal", acc.account.data);
                    } catch { return null; }
                }).filter((p: any) => p !== null);

                setActiveCount(props.length);
                if (props.length > 0) {
                    setLatestProposal(props[props.length - 1].title);
                }
            } catch (e) {
                console.error("Widget Gov Error", e);
            }
        };
        fetchGov();
    }, [wallet, connection]);

    return (
        <div className="glass-panel p-5 rounded-2xl border border-white/5 hover:border-blue-500/30 transition-colors group">
            <div className="flex justify-between items-center mb-4">
                <div className="flex items-center gap-2">
                    <div className="bg-blue-500/20 p-2 rounded-lg text-blue-400">
                        <Vote size={18} />
                    </div>
                    <h3 className="font-bold text-white">Governance</h3>
                </div>
                {activeCount > 0 && (
                    <span className="bg-blue-600 text-white text-[10px] font-bold px-2 py-0.5 rounded-full">
                        {activeCount} Active
                    </span>
                )}
            </div>

            <div className="mb-4">
                <p className="text-gray-400 text-xs uppercase tracking-wider mb-1">Latest Proposal</p>
                <div className="text-lg font-bold text-white leading-tight">
                    {latestProposal || "No Active Votes"}
                </div>
            </div>

            <Link href="/vote" className="flex items-center justify-between w-full py-3 px-4 bg-blue-600/10 hover:bg-blue-600/20 rounded-xl border border-blue-500/30 text-blue-400 transition-all font-bold text-sm">
                <span>Cast Vote</span>
                <CheckCircle2 size={16} className="group-hover:scale-110 transition-transform" />
            </Link>
        </div>
    );
}
