"use client";

import { MessageSquare, Loader2, CheckCircle, AlertCircle } from "lucide-react";
import { useWallet } from "@solana/wallet-adapter-react";
import { useGritState } from "@/components/GritStateProvider";
import { useState, useEffect } from "react";

export default function DiscordConnect({ discordId }: { discordId?: string }) {
    const { publicKey, signMessage } = useWallet();
    const { discordUser, refreshBalances } = useGritState();
    const [status, setStatus] = useState<'idle' | 'signing' | 'linking' | 'success' | 'error'>('idle');
    const [message, setMessage] = useState("");

    // If global state says linked, auto-set success
    useEffect(() => {
        if (discordUser) {
            // 3. Send to API Route
            // NOTE: The original instruction provided an incomplete fetch call.
            // This has been corrected to be syntactically valid, assuming a POST request
            // with the discordUser data in the body. Adjust as needed for your API.
            const verifyDiscordUser = async () => {
                try {
                    const response = await fetch("/api/verify", {
                        method: 'POST',
                        headers: {
                            'Content-Type': 'application/json',
                        },
                        body: JSON.stringify({
                            discordId: discordUser.id,
                            username: discordUser.username,
                            walletAddress: publicKey?.toBase58(), // Include wallet address if available
                        }),
                    });

                    if (response.ok) {
                        setStatus('success');
                        setMessage(`Linked as ${discordUser.username}`);
                    } else {
                        const errorData = await response.json();
                        setStatus('error');
                        setMessage(`Verification failed: ${errorData.message || 'Unknown error'}`);
                    }
                } catch (error) {
                    console.error("Error verifying Discord user:", error);
                    setStatus('error');
                    setMessage("Failed to verify Discord link.");
                }
            };
            verifyDiscordUser();
        }
    }, [discordUser, publicKey]); // Added publicKey to dependencies

    const handleConnect = () => {
        console.log("Connect clicked", publicKey?.toBase58());
        if (!publicKey) return;
        setStatus('linking'); // Was "connecting"
        // Redirect to our API auth route, passing the wallet address as state
        window.location.href = `/api/auth/discord?wallet=${publicKey.toBase58()}`;
    };

    if (status === 'linking' && !message) { // Was "connecting"
        return (
            <button disabled className="w-full py-2 bg-indigo-600/50 rounded-xl font-bold text-white text-sm flex justify-center items-center gap-2 cursor-wait">
                <MessageSquare size={16} className="animate-pulse" /> Connecting...
            </button>
        );
    }

    return (
        <button
            onClick={handleConnect}
            className="w-full py-2 bg-indigo-600 rounded-xl font-bold text-white text-sm flex justify-center items-center gap-2 hover:bg-indigo-500 transition-all shadow-[0_0_15px_rgba(79,70,229,0.3)]"
        >
            <MessageSquare size={16} /> Link Discord Account
        </button>
    );
}
