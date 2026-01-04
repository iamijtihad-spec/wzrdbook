"use client";

import { useAnchorWallet, useConnection } from "@solana/wallet-adapter-react";
import { TrendingUp, Activity, Zap, CheckCircle, AlertCircle } from "lucide-react";
import PrivateKeyLogin from "@/components/PrivateKeyLogin";
import { useState, useEffect } from "react";
import { AnchorProvider, BN, setProvider } from "@coral-xyz/anchor";
import { getBondingProgram } from "@/lib/solana-client";
import { PublicKey, SystemProgram } from "@solana/web3.js";
import bondingConfig from "@/lib/bonding-config.json";
import Navigation from "@/components/Navigation";
import { getAccountInfoRaw, getLatestBlockhashRaw } from "@/lib/raw-solana";
import { useGritState } from "@/components/GritStateProvider";

export default function BondingPage() {
    const { connection } = useConnection();
    // Use Global State for Wallet & Refresh
    const { walletAddress, isConnected, refreshBalances } = useGritState();
    const wallet = useAnchorWallet(); // AnchorWallet is still needed for signing

    // State
    const [price, setPrice] = useState<number | null>(null);
    const [supply, setSupply] = useState<number>(0);
    const [curveProgress, setCurveProgress] = useState<number>(0);
    const [reserve, setReserve] = useState<number | null>(null);
    const [marketCap, setMarketCap] = useState<number | null>(null);

    // Transaction State
    const [amount, setAmount] = useState<string>("1");
    const [loading, setLoading] = useState(false);
    const [status, setStatus] = useState<{ type: 'success' | 'error' | 'info', msg: string } | null>(null);

    const curveConfigPubkey = new PublicKey(bondingConfig.curveConfig);

    useEffect(() => {
        if (!wallet || !connection) return;
        fetchCurveState();
        const interval = setInterval(fetchCurveState, 5000); // Poll every 5s
        return () => clearInterval(interval);
    }, [wallet, connection]);

    const fetchCurveState = async () => {
        try {
            if (!wallet || !connection) return;

            const provider = new AnchorProvider(connection, wallet, {});
            setProvider(provider);
            const program = getBondingProgram(provider);

            // Manual Fetch to bypass StructError
            const accountInfo = await getAccountInfoRaw(connection, curveConfigPubkey);
            if (!accountInfo) return;

            const account = program.coder.accounts.decode("CurveConfig", accountInfo.data);

            // Calculate Price = Base + Slope * Supply
            const currentSupply = account.totalSupply.toNumber();
            const basePrice = account.basePrice.toNumber();
            const slope = account.slope.toNumber();

            const currentPriceLamports = basePrice + (slope * currentSupply);
            const currentPriceSol = currentPriceLamports / 1_000_000_000;

            const currentReserve = parseFloat(account.reserveBalance.toString()) / 1_000_000_000;

            setPrice(currentPriceSol);
            setSupply(currentSupply);
            setCurveProgress(Math.min((currentSupply / 1000) * 100, 100)); // Mock max supply 1000 for visuals
            setReserve(currentReserve);
            setMarketCap(currentPriceSol * currentSupply);

        } catch (e) {
            console.error("Error fetching curve state:", e);
        }
    };

    const handleBuy = async () => {
        if (!wallet) return setStatus({ type: 'error', msg: "Connect wallet first!" });

        try {
            const buyAmount = parseInt(amount);
            if (isNaN(buyAmount) || buyAmount <= 0) {
                setStatus({ type: 'error', msg: "Please enter a valid amount." });
                return;
            }

            setLoading(true);
            setStatus({ type: 'info', msg: "Processing transaction..." });

            const provider = new AnchorProvider(connection, wallet, { commitment: 'confirmed' });
            const program = getBondingProgram(provider);

            // Treat 1 UI unit as 1 Raw Unit (Token Share) for correct pricing with current contract logic
            const amountBN = new BN(buyAmount);



            // 1. Build Transaction
            const transaction = await program.methods.buy(amountBN)
                .accounts({
                    curveConfig: curveConfigPubkey,
                    user: wallet.publicKey,
                    systemProgram: SystemProgram.programId,
                })
                .transaction();

            // 2. Fetch Latest Blockhash with Fallback
            const latest = await getLatestBlockhashRaw(connection);
            transaction.recentBlockhash = latest.blockhash;
            transaction.feePayer = wallet.publicKey;

            // 3. Sign & Send
            setStatus({ type: 'info', msg: "Please sign transaction..." });
            const signedTx = await wallet.signTransaction(transaction); // standard wallet adapter sign

            setStatus({ type: 'info', msg: "Sending transaction..." });
            const signature = await connection.sendRawTransaction(signedTx.serialize());
            console.log("Tx:", signature);

            // 4. Confirm
            setStatus({ type: 'info', msg: "Confirming..." });
            if (latest.lastValidBlockHeight) {
                await connection.confirmTransaction({
                    signature,
                    blockhash: latest.blockhash,
                    lastValidBlockHeight: latest.lastValidBlockHeight
                }, 'confirmed');
            } else {
                await connection.confirmTransaction(signature, 'confirmed');
            }

            setStatus({ type: 'success', msg: `Successfully bought ${buyAmount} tokens!` });
            fetchCurveState();
            await refreshBalances(); // Update Global State (SOL & Tokens)

            // Clear success message after 3 seconds
            setTimeout(() => setStatus(null), 3000);
        } catch (e: any) {
            console.error("Buy failed:", e);
            setStatus({ type: 'error', msg: "Transaction failed: " + (e.message || e.toString()) });
        } finally {
            setLoading(false);
        }
    };

    const handleAirdrop = async () => {
        if (!wallet) return;
        setLoading(true);
        setStatus({ type: 'info', msg: "Requesting airdrop..." });
        try {
            const sig = await connection.requestAirdrop(wallet.publicKey, 1_000_000_000); // 1 SOL
            const latest = await getLatestBlockhashRaw(connection);
            await connection.confirmTransaction({
                signature: sig,
                blockhash: latest.blockhash,
                lastValidBlockHeight: latest.lastValidBlockHeight
            }, 'confirmed');
            setStatus({ type: 'success', msg: "Airdropped 1 SOL!" });
            setTimeout(() => setStatus(null), 3000);
        } catch (e: any) {
            console.error(e);
            setStatus({ type: 'error', msg: "Airdrop failed: " + e.message });
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen bg-black text-white selection:bg-orange-500/30">
            <Navigation />

            <main className="max-w-7xl mx-auto p-4 md:p-8 pb-32">
                <header className="flex flex-col md:flex-row justify-between items-center mb-12 gap-4">
                    <div>
                        <h1 className="text-4xl font-black italic bg-gradient-to-r from-orange-400 to-red-500 bg-clip-text text-transparent uppercase">
                            Fan-Investor Launchpad
                        </h1>
                        <p className="text-gray-400 mt-2">Bonding Curve Initial Offering (BCIO). Support early, profit together.</p>
                    </div>
                    <div className="flex gap-4">
                        {wallet && (
                            <button
                                onClick={handleAirdrop}
                                disabled={loading}
                                className="px-4 py-2 bg-white/10 hover:bg-white/20 rounded-xl text-sm font-bold transition-colors"
                            >
                                💧 Get Demo SOL
                            </button>
                        )}
                        {!wallet && <PrivateKeyLogin />}
                    </div>
                </header>

                <div className="grid md:grid-cols-2 gap-8 items-center">
                    <div className="bg-gray-900/50 border border-gray-700 rounded-3xl p-8 text-center space-y-6 relative overflow-hidden">
                        {/* Background Glow */}
                        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-32 h-32 bg-orange-500/20 blur-[50px] pointer-events-none" />

                        <div className="mx-auto w-24 h-24 bg-orange-500/10 rounded-full flex items-center justify-center animate-pulse relative z-10">
                            <TrendingUp className="w-12 h-12 text-orange-500" />
                        </div>

                        <div className="relative z-10">
                            <h2 className="text-2xl font-bold text-white mb-2">Next Track: "Neon Horizon"</h2>
                            <p className="text-gray-400">Minting starts at 0.0001 SOL. Price increases linearly.</p>
                        </div>

                        <div className="bg-black/40 rounded-xl p-6 text-left space-y-3 relative z-10">
                            <div className="flex justify-between text-sm">
                                <span className="text-gray-500">Current Price</span>
                                <span className="text-white font-mono text-lg">{price ? price.toFixed(6) : "..."} SOL</span>
                            </div>
                            <div className="flex justify-between text-sm">
                                <span className="text-gray-500">Market Cap</span>
                                <span className="text-blue-400 font-mono">{marketCap ? marketCap.toFixed(4) : "0.00"} SOL</span>
                            </div>
                            <div className="flex justify-between text-sm">
                                <span className="text-gray-500">Reserve</span>
                                <span className="text-green-400 font-mono">{reserve ? reserve.toFixed(4) : "0.00"} SOL</span>
                            </div>

                            <div className="pt-2">
                                <div className="flex justify-between text-xs text-gray-500 mb-1">
                                    <span>Progress</span>
                                    <span>{supply} / 1000 ({Math.round(curveProgress)}%)</span>
                                </div>
                                <div className="w-full bg-gray-800 h-2 rounded-full overflow-hidden">
                                    <div
                                        className="bg-gradient-to-r from-orange-500 to-red-500 h-full transition-all duration-1000 ease-out"
                                        style={{ width: `${curveProgress}%` }}
                                    />
                                </div>
                            </div>
                        </div>

                        <div className="space-y-3 relative z-10">
                            <div className="flex gap-2">
                                <input
                                    type="number"
                                    min="1"
                                    value={amount}
                                    onChange={(e) => setAmount(e.target.value)}
                                    className="bg-black/40 border border-gray-600 rounded-xl px-4 py-4 text-white font-mono w-1/3 text-center focus:outline-none focus:border-orange-500 transition-colors"
                                    placeholder="Qty"
                                />
                                <button
                                    onClick={handleBuy}
                                    disabled={loading || !price}
                                    className="flex-1 py-4 bg-orange-600 hover:bg-orange-500 disabled:opacity-50 disabled:cursor-not-allowed rounded-xl font-bold text-white transition-all shadow-lg hover:shadow-orange-500/20 flex items-center justify-center gap-2"
                                >
                                    {loading && <Activity className="animate-spin w-5 h-5" />}
                                    {loading ? "Purchasing..." : `Buy ${amount || 0} Tokens`}
                                </button>
                            </div>

                            {/* Status Messages */}
                            {status && (
                                <div className={`text-sm p-3 rounded-lg flex items-center justify-center gap-2 animate-in fade-in slide-in-from-bottom-2 ${status.type === 'success' ? 'bg-green-500/10 text-green-400' :
                                    status.type === 'error' ? 'bg-red-500/10 text-red-400' :
                                        'bg-blue-500/10 text-blue-400'
                                    }`}>
                                    {status.type === 'success' && <CheckCircle size={16} />}
                                    {status.type === 'error' && <AlertCircle size={16} />}
                                    {status.msg}
                                </div>
                            )}

                            <p className="text-xs text-gray-500 pt-2">Requires Localnet Wallet with SOL</p>
                        </div>
                    </div>

                    <div className="space-y-6">
                        <div className="flex gap-4 p-4 bg-gray-800/30 rounded-xl border border-white/5 hover:bg-gray-800/50 transition-colors">
                            <Zap className="text-yellow-400 mt-1 shrink-0" />
                            <div>
                                <h3 className="font-bold text-white">Instant Liquidity</h3>
                                <p className="text-sm text-gray-500">Artists get funds immediately. Fans can sell back to the curve at any time.</p>
                            </div>
                        </div>
                        <div className="flex gap-4 p-4 bg-gray-800/30 rounded-xl border border-white/5 hover:bg-gray-800/50 transition-colors">
                            <Activity className="text-blue-400 mt-1 shrink-0" />
                            <div>
                                <h3 className="font-bold text-white">Dynamic Pricing</h3>
                                <p className="text-sm text-gray-500">The earlier you buy, the lower your entry price. True price discovery for art.</p>
                            </div>
                        </div>
                    </div>
                </div>
            </main>
        </div>
    );
}
