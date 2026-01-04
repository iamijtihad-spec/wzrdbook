"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Scan, CheckCircle, XCircle, Loader2, Wifi } from "lucide-react";
import { useGritState } from "@/components/GritStateProvider";

export default function ArtifactScanner() {
    const { addScar } = useGritState();
    const [isScanning, setIsScanning] = useState(false);
    const [chipId, setChipId] = useState("");
    const [result, setResult] = useState<any>(null);
    const [error, setError] = useState("");

    const handleScan = async () => {
        if (!chipId) return;
        setIsScanning(true);
        setError("");
        setResult(null);

        try {
            const res = await fetch("/api/verify-nfc", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ chipId, signature: "mock-sig" })
            });
            const data = await res.json();

            if (data.success) {
                setResult(data.meta);
                // Add a special scar for the artifact
                addScar(`ARTIFACT_SCAN_${chipId}`, 500); // Bonus 500 Scars for hardware
            } else {
                setError(data.message || "Verification Failed");
            }
        } catch (e) {
            setError("Connection Error");
        } finally {
            setIsScanning(false);
        }
    };

    return (
        <div className="w-full max-w-md mx-auto p-8 border border-red-900/40 bg-black/60 backdrop-blur-md relative overflow-hidden group">
            <div className="flex items-center gap-3 mb-6 border-b border-red-900/20 pb-4">
                <Scan className="w-6 h-6 text-red-500 animate-pulse" />
                <h3 className="text-xl font-bold text-red-500 tracking-widest uppercase">Artifact Scanner</h3>
            </div>

            <div className="space-y-6">
                <div className="relative">
                    <input
                        type="text"
                        value={chipId}
                        onChange={(e) => setChipId(e.target.value)}
                        placeholder="ENTER CHIP ID"
                        className="w-full bg-black/40 border border-red-900/60 p-4 text-center text-red-500 font-mono focus:outline-none focus:border-red-500 transition-colors placeholder:text-red-900/40"
                    />
                    <div className="absolute right-3 top-1/2 -translate-y-1/2">
                        <Wifi className="w-4 h-4 text-red-900/60" />
                    </div>
                </div>

                <button
                    onClick={handleScan}
                    disabled={isScanning || !chipId}
                    className="w-full py-4 bg-red-900/20 border border-red-500/30 hover:bg-red-500 hover:text-black text-red-500 transition-all font-bold tracking-widest uppercase disabled:opacity-50 disabled:cursor-not-allowed group-hover:shadow-[0_0_20px_rgba(239,68,68,0.2)]"
                >
                    {isScanning ? (
                        <span className="flex items-center justify-center gap-2">
                            <Loader2 className="w-4 h-4 animate-spin" /> ESTABLISHING LINK...
                        </span>
                    ) : (
                        "INITIATE BRIDGE"
                    )}
                </button>
            </div>

            <AnimatePresence mode="wait">
                {result && (
                    <motion.div
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0 }}
                        className="mt-6 p-4 border border-green-500/30 bg-green-900/10 text-center"
                    >
                        <CheckCircle className="w-8 h-8 text-green-500 mx-auto mb-2" />
                        <h4 className="text-green-500 font-bold uppercase tracking-widest mb-1">Authenticated</h4>
                        <p className="text-xs text-green-400 font-mono">{result.name} // {result.rarity}</p>
                    </motion.div>
                )}

                {error && (
                    <motion.div
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0 }}
                        className="mt-6 p-4 border border-red-500/30 bg-red-900/10 text-center"
                    >
                        <XCircle className="w-8 h-8 text-red-500 mx-auto mb-2" />
                        <h4 className="text-red-500 font-bold uppercase tracking-widest mb-1">Breach Failed</h4>
                        <p className="text-xs text-red-400 font-mono">{error}</p>
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
}
