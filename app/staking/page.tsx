"use client";

import { useAnchorWallet, useConnection } from "@solana/wallet-adapter-react";
import { Shield, Crown, Star, Lock, Unlock, Loader2, MessageSquare } from "lucide-react";
import Image from "next/image";
import PrivateKeyLogin from "@/components/PrivateKeyLogin";
import DiscordConnect from "@/components/DiscordConnect";
import artistConfig from "@/config/artist.json";
import { useState, useMemo } from "react";
import { AnchorProvider, BN, setProvider } from "@coral-xyz/anchor";
import { getStakingProgram, PROGRAMS } from "@/lib/solana-client";
import { PublicKey } from "@solana/web3.js";
import { getAssociatedTokenAddress } from "@solana/spl-token";
import { useGritState } from "@/components/GritStateProvider";
import Navigation from "@/components/Navigation";
import { getLatestBlockhashRaw } from "@/lib/raw-solana";
import { ECONOMIC_DATA } from "@/constants/economics";

const STAKE_MINT = new PublicKey("2FFhBNoCqsgXejrqQXk3gJXWyG9nuiE7qj4Sv2wrcnwq"); // MOXY Mint

export default function StakingPage() {
    const { connection } = useConnection();
    const wallet = useAnchorWallet();
    const { stakedAmount, moxyBalance, refreshBalances, stakingTier, stakeStartTime } = useGritState();

    const [loading, setLoading] = useState(false);
    const [status, setStatus] = useState<string>("");

    const TIERS = [
        { name: "Bronze", req: ECONOMIC_DATA.ROLES.BRONZE.MOXY, icon: Shield, color: "text-amber-700", border: "border-amber-700/50", rewards: ["Access to Discord", "Early Merch"] },
        { name: "Silver", req: ECONOMIC_DATA.ROLES.SILVER.MOXY, icon: Star, color: "text-gray-300", border: "border-gray-400/50", rewards: ["Stems Download", "Vote Rights", "5% Store Discount"] },
        { name: "Gold", req: ECONOMIC_DATA.ROLES.GOLD.MOXY, icon: Crown, color: "text-yellow-400", border: "border-yellow-500/50", rewards: ["1-on-1 Artist DM", "Backstage Pass", "Free Vinyl"] },
        { name: "Diamond", req: ECONOMIC_DATA.ROLES.DIAMOND.MOXY, icon: Crown, color: "text-cyan-400", border: "border-cyan-500/50", rewards: ["Treasury Governance", "Inner Sanctum Access", "Revenue Share"] },
    ];

    const handleStake = async (targetAmount: number) => {
        if (!wallet) return alert("Connect Wallet");

        // Calculate needed amount: Target - Current Staked
        let amountToStake = targetAmount - stakedAmount;
        if (amountToStake <= 0) {
            setStatus("You already have enough staked for this tier.");
            setTimeout(() => setStatus(""), 3000);
            return;
        }

        setLoading(true);
        setStatus("Initializing Staking...");

        try {
            const provider = new AnchorProvider(connection, wallet, { commitment: 'confirmed' });
            setProvider(provider);
            const program = getStakingProgram(provider);

            // PDAs
            const [userStakePDA] = PublicKey.findProgramAddressSync(
                [Buffer.from("stake"), wallet.publicKey.toBuffer()],
                program.programId
            );

            // User ATA
            const userTokenAccount = await getAssociatedTokenAddress(STAKE_MINT, wallet.publicKey);

            // Vault: Assuming ATA of the program itself (common simplified pattern)
            const stakeVault = await getAssociatedTokenAddress(STAKE_MINT, program.programId, true);

            setStatus("Preparing Transaction...");

            // 9 decimals
            const amountBN = new BN(amountToStake * 1_000_000_000);

            // 1. Build Transaction Instruction
            const transaction = await program.methods.stake(amountBN)
                .accounts({
                    userStake: userStakePDA,
                    userTokenAccount: userTokenAccount,
                    stakeVault: stakeVault,
                    user: wallet.publicKey,
                })
                .transaction();

            // 2. Fetch Latest Blockhash
            const latest = await getLatestBlockhashRaw(connection);
            const blockhash = latest.blockhash;
            const lastValidBlockHeight = latest.lastValidBlockHeight;

            transaction.recentBlockhash = blockhash;
            transaction.feePayer = wallet.publicKey;

            // 3. Sign Transaction
            setStatus("Please Sign Transaction...");
            const signedTx = await wallet.signTransaction(transaction);

            // 4. Send Raw Transaction
            setStatus("Sending Transaction...");
            const signature = await connection.sendRawTransaction(signedTx.serialize());
            console.log("Tx Signature:", signature);

            // 5. Confirm Transaction
            setStatus("Confirming...");
            if (lastValidBlockHeight) {
                await connection.confirmTransaction({
                    signature,
                    blockhash,
                    lastValidBlockHeight
                }, 'confirmed');
            } else {
                await connection.confirmTransaction(signature, 'confirmed');
            }

            setStatus("Success! Refreshing...");
            await refreshBalances();
            setStatus("");
        } catch (e: any) {
            console.error("Stake failed:", e);

            let errorMessage = "Transaction failed: " + (e.message || e.toString());

            // Check for specific "no record of prior credit" error (empty wallet)
            if (e.message && e.message.includes("Attempt to debit an account but found no record of a prior credit")) {
                errorMessage = "Transaction failed: Your wallet has no SOL on Devnet. Please Airdrop SOL to pay for gas fees.";
            }

            // Log logs if available
            if (e.logs) {
                console.error("Transaction Logs:", e.logs);
            }

            setStatus(errorMessage);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen bg-black text-white selection:bg-yellow-500/30">
            <Navigation />

            <main className="max-w-7xl mx-auto p-4 md:p-8 pb-32">
                <header className="flex flex-col md:flex-row justify-between items-center mb-12 gap-4">
                    <div>
                        <h1 className="text-4xl font-black italic bg-gradient-to-r from-yellow-200 to-yellow-500 bg-clip-text text-transparent uppercase">
                            Backstage Pass
                        </h1>
                        <p className="text-gray-400 mt-2">Stake MOXY (Sister Coin) to unlock elite perks.</p>
                    </div>
                    {!wallet && <PrivateKeyLogin />}
                </header>

                {wallet && (
                    <div className="bg-gray-900/50 rounded-2xl p-6 mb-8 border border-white/10 flex flex-col md:flex-row justify-between items-center">
                        <div className="mb-4 md:mb-0">
                            <h2 className="text-gray-400 text-sm uppercase tracking-wider font-bold">Your Staked Balance</h2>
                            <div className="text-3xl font-mono text-white font-bold flex items-center gap-2">
                                <Image src="/icons/moxy.svg" alt="MOXY" width={32} height={32} />
                                {stakedAmount.toFixed(2)} MXY
                            </div>
                            <div className="text-sm text-gray-500 flex items-center gap-2">
                                <span>Current Tier:</span>
                                <span className={`font-bold ${stakingTier === "Gold" ? "text-yellow-400" :
                                    stakingTier === "Silver" ? "text-gray-300" :
                                        stakingTier === "Bronze" ? "text-amber-700" : "text-gray-600"
                                    }`}>{stakingTier}</span>
                            </div>
                        </div>
                        <div className="text-right">
                            <h2 className="text-gray-400 text-sm uppercase tracking-wider font-bold">Wallet Balance</h2>
                            <div className="text-xl font-mono text-gray-300 flex items-center justify-end gap-2">
                                {moxyBalance.toLocaleString()} MXY
                                <Image src="/icons/moxy.svg" alt="MOXY" width={24} height={24} />
                            </div>
                        </div>
                    </div>
                )}

                {status && (
                    <div className="mb-8 p-4 bg-blue-500/20 border border-blue-500/50 rounded-xl text-blue-200 flex items-center gap-3">
                        <Loader2 className="animate-spin" size={20} />
                        {status}
                    </div>
                )}

                <div className="grid md:grid-cols-3 gap-6">
                    {TIERS.map((tier) => {
                        const isUnlocked = stakedAmount >= tier.req;
                        const canAfford = moxyBalance >= (tier.req - stakedAmount);
                        const isNext = !isUnlocked && (stakingTier === "None" || (stakingTier === "Bronze" && tier.name === "Silver") || (stakingTier === "Silver" && tier.name === "Gold"));

                        return (
                            <div key={tier.name} className={`bg-gray-900/50 border ${tier.border} rounded-3xl p-8 relative overflow-hidden group hover:bg-gray-800/50 transition-all ${isUnlocked ? 'bg-white/5' : ''}`}>
                                <div className={`absolute top-4 right-4 opacity-20 group-hover:opacity-40 transition-opacity ${tier.color}`}>
                                    <tier.icon size={100} />
                                </div>

                                {/* Tier Icon / Image */}
                                <div className={`p-4 rounded-full bg-gradient-to-br ${tier.color} mb-4 relative group-hover:scale-110 transition-transform duration-300`}>
                                    <div className="absolute inset-0 bg-white/20 blur-xl rounded-full" />
                                    {/* Map tiers to images */}
                                    {tier.name === "Bronze" && <Image src="/discord-assets/role-bronze.png" alt="Bronze" width={48} height={48} className="relative z-10 pixelated" />}
                                    {tier.name === "Silver" && <Image src="/discord-assets/role-silver.png" alt="Silver" width={48} height={48} className="relative z-10 pixelated" />}
                                    {tier.name === "Gold" && <Image src="/discord-assets/role-gold.png" alt="Gold" width={48} height={48} className="relative z-10 pixelated" />}
                                    {(tier.name === "Platinum" || tier.name === "Diamond") && <Image src="/discord-assets/role-diamond.png" alt="Diamond" width={48} height={48} className="relative z-10 pixelated" />}

                                    {/* Fallback for others if any */}
                                    {!["Bronze", "Silver", "Gold", "Platinum", "Diamond"].includes(tier.name) && <tier.icon size={32} className="relative z-10 text-white" />}
                                </div>
                                <h3 className="text-2xl font-bold text-white mb-1">{tier.name} Tier</h3>
                                <p className={`font-mono font-bold ${tier.color} mb-6 flex items-center gap-2`}>
                                    {tier.req} MXY
                                    <Image src="/icons/moxy.svg" alt="MOXY" width={20} height={20} />
                                </p>

                                <ul className="space-y-3 mb-8">
                                    {tier.rewards.map(r => (
                                        <li key={r} className="flex items-center gap-2 text-sm text-gray-300">
                                            <span className="text-green-400">✓</span> {r}
                                        </li>
                                    ))}
                                </ul>

                                {isUnlocked ? (
                                    <>
                                        <button disabled className="w-full py-3 bg-green-500/20 border border-green-500/50 rounded-xl font-bold text-green-400 cursor-default flex justify-center items-center gap-2">
                                            <Unlock size={16} /> Active
                                        </button>
                                        {tier.name === "Bronze" && (
                                            <div className="mt-2 text-center space-y-2">
                                                <DiscordConnect />
                                                <p className="text-[10px] text-gray-500">Links your wallet & assigns roles.</p>
                                            </div>
                                        )}
                                    </>
                                ) : (
                                    <button
                                        onClick={() => handleStake(tier.req)}
                                        disabled={loading || !canAfford}
                                        className={`w-full py-3 rounded-xl font-bold transition-all flex justify-center items-center gap-2 ${canAfford
                                            ? 'bg-white/10 hover:bg-white/20 border border-white/10 text-white'
                                            : 'bg-gray-800 text-gray-500 cursor-not-allowed'
                                            }`}
                                    >
                                        {loading ? "Processing..." : canAfford ? "Stake to Unlock" : "Insufficient Balance"}
                                    </button>
                                )}
                            </div>
                        );
                    })}
                </div>

                <div className="mt-12 text-center text-gray-500 text-sm max-w-lg mx-auto">
                    {stakedAmount > 0 && (
                        <div className="bg-red-500/10 border border-red-500/30 rounded-xl p-6 mb-8">
                            <h3 className="text-red-400 font-bold uppercase mb-2">Danger Zone</h3>
                            <p className="mb-4">Unstaking interface is active for Devnet evaluation.</p>

                            {stakeStartTime && (() => {
                                const lockupEnd = stakeStartTime + (7 * 24 * 60 * 60 * 1000);
                                const isLocked = Date.now() < lockupEnd;
                                const daysLeft = Math.ceil((lockupEnd - Date.now()) / (1000 * 60 * 60 * 24));

                                return (
                                    <div className="flex flex-col gap-2 justify-center items-center">
                                        <p className="text-sm">
                                            Lock-up Status: {isLocked ? <span className="text-red-400 font-bold">LOCKED ({daysLeft} days left)</span> : <span className="text-green-400 font-bold">UNLOCKED</span>}
                                        </p>
                                        <button
                                            disabled={isLocked}
                                            className={`px-6 py-2 rounded-lg font-bold border ${isLocked ? 'border-gray-600 text-gray-600 bg-transparent cursor-not-allowed' : 'border-red-500 text-red-400 hover:bg-red-500/20'}`}
                                            onClick={() => alert("Unstake logic would trigger here. (Contract interaction required)")}
                                        >
                                            {isLocked ? `Locked until ${new Date(lockupEnd).toLocaleDateString()}` : "Unstake All"}
                                        </button>
                                        <p className="text-xs mt-2 opacity-50">Early unstake penalty: 10% (sent to Treasury)</p>
                                    </div>
                                );
                            })()}
                        </div>
                    )}

                    <p>
                        Staking removes tokens from circulation. Tokens are locked in the protocol vault.
                        <br />
                        <span className="text-xs opacity-50">Staking Contract: {PROGRAMS.STAKING ? PROGRAMS.STAKING.toBase58() : "..."}</span>
                    </p>
                </div>
            </main>
        </div>
    );
}
