"use client";

import { useState } from "react";
import { useConnection, useWallet } from "@solana/wallet-adapter-react";

interface ClaimNFTProps {
    nftMint: string;
    nftName: string;
    price: number;
    tier: string;
    onClose: () => void;
    onSuccess: () => void;
}

export default function ClaimNFT({ nftMint, nftName, price, tier, onClose, onSuccess }: ClaimNFTProps) {
    const { connection } = useConnection();
    const { publicKey } = useWallet();
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState("");
    const [signature, setSignature] = useState("");
    const [success, setSuccess] = useState(false);

    const handleClaim = async () => {
        if (!publicKey) {
            setError("Please connect your wallet");
            return;
        }

        setLoading(true);
        setError("");

        try {
            // Call backend to claim NFT
            const response = await fetch("/api/nfts/claim", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify({
                    claimerAddress: publicKey.toBase58(),
                    nftMint,
                }),
            });

            const data = await response.json();

            if (!response.ok) {
                throw new Error(data.error || "Claim failed");
            }

            setSignature(data.signature);

            // Poll for transaction confirmation
            let confirmed = false;
            let attempts = 0;
            const maxAttempts = 30; // 30 seconds max

            while (!confirmed && attempts < maxAttempts) {
                try {
                    const status = await connection.getSignatureStatus(data.signature);
                    if (status?.value?.confirmationStatus === 'confirmed' || status?.value?.confirmationStatus === 'finalized') {
                        confirmed = true;
                        break;
                    }
                } catch (e) {
                    console.log("Checking confirmation...", e);
                }
                await new Promise(resolve => setTimeout(resolve, 1000));
                attempts++;
            }

            if (!confirmed) {
                console.warn("Transaction may still be confirming. Check explorer for status.");
            }

            setSuccess(true);

            setTimeout(() => {
                onSuccess();
            }, 2000);

            // eslint-disable-next-line @typescript-eslint/no-explicit-any
        } catch (err: any) {
            console.error("Claim error:", err);
            setError(err.message || "Claim failed");
        } finally {
            setLoading(false);
        }
    };

    if (success) {
        return (
            <div className="fixed inset-0 bg-black/80 flex items-center justify-center z-50 p-4">
                <div className="bg-zinc-900 border border-green-500/50 rounded-xl p-8 max-w-md w-full">
                    <div className="text-center">
                        <div className="w-16 h-16 bg-green-500/20 rounded-full flex items-center justify-center mx-auto mb-4">
                            <svg className="w-8 h-8 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                            </svg>
                        </div>
                        <h3 className="text-2xl font-bold text-white mb-2">NFT Claimed!</h3>
                        <p className="text-zinc-400 mb-4">NFT has been transferred to your wallet</p>
                        <a
                            href={`https://explorer.solana.com/tx/${signature}?cluster=devnet`}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-orange-500 hover:text-orange-400 text-sm underline"
                        >
                            View on Solana Explorer
                        </a>
                        <button
                            onClick={onClose}
                            className="mt-6 w-full py-3 bg-zinc-800 hover:bg-zinc-700 text-white font-bold rounded-lg transition-colors"
                        >
                            Close
                        </button>
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className="fixed inset-0 bg-black/80 flex items-center justify-center z-50 p-4">
            <div className="bg-zinc-900 border border-zinc-700 rounded-xl p-8 max-w-md w-full">
                <div className="flex items-center justify-between mb-6">
                    <h3 className="text-2xl font-bold text-white">Claim NFT</h3>
                    <button
                        onClick={onClose}
                        disabled={loading}
                        className="text-zinc-500 hover:text-white transition-colors disabled:opacity-50"
                    >
                        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                        </svg>
                    </button>
                </div>

                <div className="mb-6 p-4 bg-zinc-800 rounded-lg">
                    <p className="text-zinc-400 text-sm mb-1">NFT:</p>
                    <p className="text-white font-bold text-lg">{nftName}</p>
                    <div className="flex items-center gap-2 mt-2">
                        <span className={`px-2 py-1 text-xs font-bold uppercase rounded-full ${tier === 'Legendary' ? 'bg-yellow-500/20 text-yellow-400' :
                            tier === 'Rare' ? 'bg-blue-500/20 text-blue-400' :
                                'bg-zinc-500/20 text-zinc-400'
                            }`}>
                            {tier}
                        </span>
                    </div>
                </div>

                <div className="mb-6 p-4 bg-orange-500/10 border border-orange-500/30 rounded-lg">
                    <p className="text-zinc-400 text-sm mb-1">Required GRIT Balance:</p>
                    <p className="text-orange-400 font-bold text-2xl">{price.toLocaleString()} GRIT</p>
                    <p className="text-xs text-zinc-500 mt-2">Your balance will be checked automatically</p>
                </div>

                {error && (
                    <div className="mb-4 p-3 bg-red-900/20 border border-red-500/50 rounded-lg">
                        <p className="text-red-400 text-sm">{error}</p>
                    </div>
                )}

                <div className="flex gap-3">
                    <button
                        onClick={onClose}
                        disabled={loading}
                        className="flex-1 py-3 bg-zinc-800 hover:bg-zinc-700 text-white font-bold rounded-lg transition-colors disabled:opacity-50"
                    >
                        Cancel
                    </button>
                    <button
                        onClick={handleClaim}
                        disabled={loading}
                        className="flex-1 py-3 bg-orange-500 hover:bg-orange-600 text-white font-bold rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                    >
                        {loading ? (
                            <>
                                <svg className="animate-spin h-5 w-5" fill="none" viewBox="0 0 24 24">
                                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                                </svg>
                                Claiming...
                            </>
                        ) : (
                            "Claim NFT"
                        )}
                    </button>
                </div>

                <p className="text-xs text-zinc-500 mt-4 text-center">
                    No token transfer required - just hold the required GRIT!
                </p>
            </div>
        </div>
    );
}
