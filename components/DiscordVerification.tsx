"use client";

import { useState, useEffect } from "react";
import { useWallet } from "@solana/wallet-adapter-react";
import { useSearchParams, useRouter } from "next/navigation";
import { Loader2, CheckCircle, AlertCircle, ShieldCheck } from "lucide-react";
import bs58 from "bs58";
import { useGritState } from "@/components/GritStateProvider";

export default function DiscordVerification() {
    const { publicKey, signMessage } = useWallet();
    const { setDiscordUser } = useGritState();
    const router = useRouter();
    const searchParams = useSearchParams();
    const discordId = searchParams?.get("discordId");

    const [status, setStatus] = useState<'idle' | 'signing' | 'verifying' | 'success' | 'error'>('idle');
    const [errorMsg, setErrorMsg] = useState("");

    const handleVerify = async () => {
        if (!publicKey || !signMessage || !discordId) return;

        try {
            setStatus('signing');
            const message = `Verify ownership of ${publicKey.toBase58()} for Discord User ${discordId}`;
            const encodedMessage = new TextEncoder().encode(message);

            const signature = await signMessage(encodedMessage);
            const signatureBase58 = bs58.encode(signature);

            setStatus('verifying');
            const res = await fetch("/api/verify", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    discordId,
                    walletAddress: publicKey.toBase58(),
                    signature: signatureBase58,
                    message
                })
            });

            const data = await res.json();

            if (res.ok && data.success) {
                setStatus('success');
                // Update global state mock
                setDiscordUser({
                    username: "VerifiedUser", // In real app, API returns this
                    id: discordId,
                    avatar: "",
                    roles: ["Verified"],
                    isBooster: false
                });
                setTimeout(() => router.push("/"), 2000);
            } else {
                throw new Error(data.error || "Verification failed");
            }

        } catch (e: any) {
            console.error(e);
            setStatus('error');
            setErrorMsg(e.message || "Failed to verify signature.");
        }
    };

    if (!discordId) {
        return (
            <div className="flex flex-col items-center justify-center p-8 bg-[#1a1a1a] border border-red-500/30 rounded-xl">
                <AlertCircle className="w-12 h-12 text-red-500 mb-4" />
                <h2 className="text-xl font-bold text-white mb-2">Invalid Link</h2>
                <p className="text-[#888] text-center">Missing Discord ID. Please try connecting again from the main settings.</p>
                <button
                    onClick={() => router.push("/")}
                    className="mt-6 px-6 py-2 bg-[#333] hover:bg-[#444] text-white rounded-lg transition-colors"
                >
                    Return Home
                </button>
            </div>
        );
    }

    if (status === 'success') {
        return (
            <div className="flex flex-col items-center justify-center p-12 bg-[#1a1a1a] border border-green-500/30 rounded-xl animate-in fade-in zoom-in duration-500">
                <CheckCircle className="w-16 h-16 text-green-500 mb-6" />
                <h2 className="text-2xl font-bold text-white mb-2">Identity Verified</h2>
                <p className="text-[#888] mb-6">Redirecting to Dashboard...</p>
                <Loader2 className="w-6 h-6 text-[#555] animate-spin" />
            </div>
        );
    }

    return (
        <div className="max-w-md mx-auto bg-[#1a1a1a] border border-[#333] p-8 rounded-xl shadow-2xl">
            <div className="text-center mb-8">
                <ShieldCheck className="w-12 h-12 text-[#d4af37] mx-auto mb-4" />
                <h1 className="text-2xl font-bold text-white">Verify Ownership</h1>
                <p className="text-[#888] mt-2 text-sm">
                    Sign a message to prove you own wallet <br />
                    <span className="font-mono text-[#d4af37]">{publicKey?.toBase58().substring(0, 6)}...{publicKey?.toBase58().substring(38)}</span>
                </p>
            </div>

            {status === 'error' && (
                <div className="mb-6 p-4 bg-red-500/10 border border-red-500/30 rounded-lg flex items-start gap-3">
                    <AlertCircle className="w-5 h-5 text-red-500 shrink-0 mt-0.5" />
                    <p className="text-red-200 text-sm">{errorMsg}</p>
                </div>
            )}

            <button
                onClick={handleVerify}
                disabled={status === 'signing' || status === 'verifying'}
                className="w-full py-4 bg-[#d4af37] text-black font-bold uppercase tracking-widest hover:bg-white transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-3"
            >
                {(status === 'signing' || status === 'verifying') ? (
                    <><Loader2 className="w-5 h-5 animate-spin" /> VERIFYING...</>
                ) : (
                    "SIGN TO VERIFY"
                )}
            </button>

            <p className="mt-6 text-center text-xs text-[#555]">
                This request is secure and does not trigger a transaction.
            </p>
        </div>
    );
}
