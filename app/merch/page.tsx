"use client";

import { useGritState } from "@/components/GritStateProvider";
import { useWallet } from "@solana/wallet-adapter-react";
import { Smartphone, Shirt, Disc, Package, Scan } from "lucide-react";
import { useState } from "react";
import PrivateKeyLogin from "@/components/PrivateKeyLogin";
import Image from "next/image";

export default function MerchPage() {
    const { connected } = useWallet();
    const { gritBalance, chiBalance } = useGritState();
    const [isScanning, setIsScanning] = useState(false);
    const [scanResult, setScanResult] = useState("");

    const handleNFCScan = () => {
        setIsScanning(true);
        // Mock Scan Delay
        setTimeout(() => {
            setScanResult("Scanned: AUTHENTIC WZRD HOODIE #042");
            setIsScanning(false);
        }, 2000);
    };

    return (
        <div className="min-h-screen p-4 md:p-8 pb-24">
            <header className="flex justify-between items-center mb-12">
                <div>
                    <h1 className="text-4xl font-black italic bg-gradient-to-r from-purple-400 to-pink-400 bg-clip-text text-transparent">
                        PHYGITAL MERCH
                    </h1>
                    <p className="text-gray-400 mt-2">Wear the Music. Own the Asset.</p>
                </div>
                <div className="text-right">
                    <p className="text-xs text-gray-500 uppercase tracking-widest">Your Balance</p>
                    <p className="text-xl font-mono text-purple-400">{chiBalance.toLocaleString()} CHI</p>
                </div>
            </header>

            <div className="grid md:grid-cols-2 gap-12">

                {/* Store Section */}
                <div className="space-y-8">
                    <h2 className="text-2xl font-bold text-white flex items-center gap-2">
                        <Shirt className="text-purple-500" /> Limited Drops
                    </h2>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        {/* Hoodie Item */}
                        <div className="bg-gray-800/50 rounded-2xl border border-gray-700 p-4 group hover:border-purple-500/50 transition-all">
                            <div className="aspect-square bg-black rounded-xl mb-4 relative overflow-hidden">
                                <span className="absolute top-2 right-2 bg-purple-600 text-white text-xs font-bold px-2 py-1 rounded">NFC CHIPPED</span>
                                <div className="absolute inset-0 flex items-center justify-center text-gray-700">
                                    <Shirt size={64} />
                                </div>
                            </div>
                            <h3 className="font-bold text-white">Void Hoodie v1</h3>
                            <p className="text-gray-400 text-sm mb-4">Includes Digital "Armor" NFT</p>
                            <div className="flex justify-between items-center">
                                <span className="text-purple-300 font-mono">500 CHI</span>
                                <button className="px-3 py-1 bg-white text-black text-xs font-bold rounded hover:bg-gray-200">
                                    PRE-ORDER
                                </button>
                            </div>
                        </div>

                        {/* Vinyl Item */}
                        <div className="bg-gray-800/50 rounded-2xl border border-gray-700 p-4 group hover:border-pink-500/50 transition-all">
                            <div className="aspect-square bg-black rounded-xl mb-4 relative overflow-hidden">
                                <span className="absolute top-2 right-2 bg-pink-600 text-white text-xs font-bold px-2 py-1 rounded">SIGNED</span>
                                <div className="absolute inset-0 flex items-center justify-center text-gray-700">
                                    <Disc size={64} />
                                </div>
                            </div>
                            <h3 className="font-bold text-white">Genesis Vinyl</h3>
                            <p className="text-gray-400 text-sm mb-4">Unlocks "Listener" Role</p>
                            <div className="flex justify-between items-center">
                                <span className="text-purple-300 font-mono">1,500 CHI</span>
                                <button className="px-3 py-1 bg-white text-black text-xs font-bold rounded hover:bg-gray-200">
                                    SOLD OUT
                                </button>
                            </div>
                        </div>
                    </div>
                </div>

                {/* NFC Redemption Section */}
                <div className="bg-gradient-to-br from-gray-900 to-black rounded-3xl border border-gray-800 p-8 flex flex-col items-center justify-center text-center">
                    <div className="p-4 bg-purple-900/20 rounded-full mb-6 relative">
                        <div className="absolute inset-0 bg-purple-500/20 rounded-full animate-ping" />
                        <Scan size={48} className="text-purple-400 relative z-10" />
                    </div>

                    <h2 className="text-2xl font-bold text-white mb-2">Verify Authenticity</h2>
                    <p className="text-gray-400 mb-8 max-w-sm">
                        Tap your phone to the NFC chip on your official merchandise to verify its authenticity and claim your Digital Twin NFT.
                    </p>

                    {scanResult ? (
                        <div className="bg-green-900/30 border border-green-500/30 p-4 rounded-xl w-full max-w-xs animate-in zoom-in">
                            <p className="text-green-400 font-bold mb-1">✓ Verified</p>
                            <p className="text-white text-sm">{scanResult}</p>
                            <button
                                onClick={() => setScanResult("")}
                                className="mt-3 text-xs text-gray-400 underline hover:text-white"
                            >
                                Scan Another
                            </button>
                        </div>
                    ) : (
                        <button
                            onClick={handleNFCScan}
                            disabled={isScanning}
                            className="bg-purple-600 hover:bg-purple-500 text-white font-bold py-3 px-8 rounded-full transition-all hover:scale-105 active:scale-95 disabled:opacity-50 disabled:scale-100"
                        >
                            {isScanning ? "Scanning..." : "Activate NFC Scanner"}
                        </button>
                    )}

                    {!connected && (
                        <div className="mt-8 pt-8 border-t border-gray-800 w-full">
                            <p className="text-zinc-500 text-xs mb-3">Connect wallet to store claimed assets</p>
                            <PrivateKeyLogin />
                        </div>
                    )}
                </div>

            </div>
        </div>
    );
}
