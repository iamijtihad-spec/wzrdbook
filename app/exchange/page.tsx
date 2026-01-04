"use client";

import { useWallet } from "@solana/wallet-adapter-react";
import { useState } from "react";
import Navigation from "@/components/Navigation";
import WalletButton from "@/components/WalletButton";
import { Connection, PublicKey, Transaction, SystemProgram, LAMPORTS_PER_SOL } from "@solana/web3.js";

import { TOKEN_MINTS, TREASURY_VAULT } from "@/constants/tokens";

// Exchange Rate: 1 SOL = 1000 GRIT
const EXCHANGE_RATE = 1000;
const RECIPIENT_WALLET = TREASURY_VAULT;

export default function ExchangePage() {
    const { publicKey, signTransaction, connected } = useWallet();
    const [solAmount, setSolAmount] = useState<string>("");
    const [isLoading, setIsLoading] = useState(false);
    const [status, setStatus] = useState<string | null>(null);

    const gritAmount = solAmount ? parseFloat(solAmount) * EXCHANGE_RATE : 0;

    const handleSwap = async () => {
        if (!publicKey || !signTransaction) return;

        try {
            setIsLoading(true);
            setStatus("Preparing transaction...");

            const connection = new Connection("https://api.devnet.solana.com", "confirmed");

            const transaction = new Transaction().add(
                SystemProgram.transfer({
                    fromPubkey: publicKey,
                    toPubkey: new PublicKey(RECIPIENT_WALLET),
                    lamports: parseFloat(solAmount) * LAMPORTS_PER_SOL,
                })
            );

            const { blockhash } = await connection.getLatestBlockhash();
            transaction.recentBlockhash = blockhash;
            transaction.feePayer = publicKey;

            setStatus("Please sign the transaction...");
            const signedMsg = await signTransaction(transaction);

            setStatus("Sending transaction...");
            const signature = await connection.sendRawTransaction(signedMsg.serialize());

            setStatus("Confirming transaction...");
            await connection.confirmTransaction(signature);

            setStatus("Verifying and Transferring GRIT...");

            // Backend Verification
            const response = await fetch("/api/exchange", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    signature,
                    userPublicKey: publicKey.toBase58(),
                    amountSol: parseFloat(solAmount)
                })
            });

            const data = await response.json();

            if (data.success) {
                setStatus("Swap Successful! GRIT has been airdropped.");
                setSolAmount("");
                // Optional: Play success sound or animation
            } else {
                setStatus(`Error: ${data.message || "Verification failed"}`);
            }

        } catch (error: any) {
            console.log("Swap flow interrupted:", error);
            if (error?.message?.includes("rejected") || error?.name === "WalletSignTransactionError") {
                setStatus("Transaction cancelled by user.");
            } else {
                console.error("Swap Error:", error);
                setStatus(`Transaction Failed: ${error.message}`);
            }
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="min-h-screen pb-32">
            <Navigation />

            <main className="max-w-4xl mx-auto px-4 py-12 mt-24">
                <header className="mb-12 text-center relative">
                    <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[300px] bg-yellow-500/10 blur-[120px] rounded-full -z-10 pointer-events-none" />
                    <h1 className="text-5xl md:text-7xl font-black text-white mb-6 tracking-tight text-glow-gold">
                        Donors <span className="text-transparent bg-clip-text bg-gradient-to-r from-yellow-400 to-orange-500">Exchange</span>
                    </h1>
                    <p className="text-xl text-gray-300 max-w-2xl mx-auto">
                        Support the project and receive <span className="text-white font-bold">GRIT</span> instantly.
                        <br />
                        <span className="text-sm text-gray-500 mt-2 block">All proceeds go towards Merch creation for holders.</span>
                    </p>
                </header>

                <div className="glass-panel p-8 rounded-3xl max-w-lg mx-auto bg-black/40 border-yellow-500/20 shadow-[0_0_50px_rgba(234,179,8,0.1)]">
                    <div className="flex justify-between items-center mb-8 bg-white/5 p-4 rounded-xl border border-white/5">
                        <span className="text-gray-400 font-mono text-sm">EXCHANGE RATE</span>
                        <span className="text-white font-bold text-xl">1 SOL = {EXCHANGE_RATE.toLocaleString()} GRIT</span>
                    </div>

                    <div className="space-y-6">
                        {/* Input SOL */}
                        <div className="relative group">
                            <label className="block text-xs font-bold text-gray-500 uppercase tracking-widest mb-2">You Send</label>
                            <div className="relative">
                                <input
                                    type="number"
                                    value={solAmount}
                                    onChange={(e) => setSolAmount(e.target.value)}
                                    placeholder="0.0"
                                    className="w-full bg-black/50 border border-gray-700 rounded-xl py-4 px-4 text-3xl font-bold text-white focus:border-yellow-500 focus:outline-none transition-colors"
                                    disabled={isLoading}
                                />
                                <span className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 font-bold">SOL</span>
                            </div>
                        </div>

                        {/* Arrow */}
                        <div className="flex justify-center -my-2 relative z-10">
                            <div className="bg-gray-800 rounded-full p-2 border border-gray-700 text-yellow-500 text-xl">
                                ↓
                            </div>
                        </div>

                        {/* Output GRIT */}
                        <div>
                            <label className="block text-xs font-bold text-gray-500 uppercase tracking-widest mb-2">You Receive</label>
                            <div className="bg-gray-900/50 border border-gray-800 rounded-xl py-4 px-4 flex justify-between items-center">
                                <span className="text-3xl font-bold text-yellow-400">{gritAmount.toLocaleString()}</span>
                                <span className="text-gray-400 font-bold">GRIT</span>
                            </div>
                        </div>

                        {/* Status Message */}
                        {status && (
                            <div className={`p-4 rounded-xl text-center text-sm font-bold ${status.includes("Successful") ? "bg-green-500/20 text-green-400" : status.includes("Error") || status.includes("Failed") ? "bg-red-500/20 text-red-400" : "bg-blue-500/20 text-blue-400"}`}>
                                {status}
                            </div>
                        )}

                        {/* Action Button */}
                        {!connected ? (
                            <div className="flex justify-center pt-4">
                                <WalletButton />
                            </div>
                        ) : (
                            <button
                                onClick={handleSwap}
                                disabled={isLoading || !solAmount || parseFloat(solAmount) <= 0}
                                className="w-full py-4 bg-gradient-to-r from-yellow-500 to-orange-500 hover:from-yellow-400 hover:to-orange-400 text-black font-black text-xl rounded-xl shadow-lg shadow-orange-500/20 transition-all hover:scale-[1.02] disabled:opacity-50 disabled:cursor-not-allowed"
                            >
                                {isLoading ? "PROCESSING..." : "SWAP NOW"}
                            </button>
                        )}

                        <p className="text-center text-xs text-gray-600 mt-4">
                            By swapping, you verify that you are donating to the GRIT project development fund.
                        </p>
                    </div>
                </div>
            </main>
        </div>
    );
}
