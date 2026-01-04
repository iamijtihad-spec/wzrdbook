
"use client";

import { useState, useEffect } from "react";
import { Keypair } from "@solana/web3.js";
import bs58 from "bs58";
import { encryptData, decryptData } from "@/lib/crypto-utils";

export default function PrivateKeyLogin() {
    const [isOpen, setIsOpen] = useState(false);
    const [mode, setMode] = useState<"login" | "import">("login");

    // Inputs
    const [privateKey, setPrivateKey] = useState("");
    const [password, setPassword] = useState("");
    const [confirmPassword, setConfirmPassword] = useState("");

    const [error, setError] = useState("");
    const [loading, setLoading] = useState(false);

    // State
    const [hasEncryptedKey, setHasEncryptedKey] = useState(false);
    const [isUnlocked, setIsUnlocked] = useState(false);

    useEffect(() => {
        // Check local storage for encrypted bundle
        const encrypted = localStorage.getItem("GRIT_ENCRYPTED_WALLET");
        if (encrypted) {
            setHasEncryptedKey(true);
            setMode("login");
        } else {
            setMode("import");
        }

        // Check session for active key
        const sessionKey = sessionStorage.getItem("GRIT_SESSION_KEY");
        if (sessionKey) {
            setIsUnlocked(true);
        }
    }, []);

    const handleImport = async () => {
        try {
            setError("");
            setLoading(true);

            if (!privateKey || !password || !confirmPassword) {
                throw new Error("All fields required");
            }

            if (password !== confirmPassword) {
                throw new Error("Passwords do not match");
            }

            if (password.length < 8) {
                throw new Error("Password must be at least 8 characters");
            }

            // Validate key
            try {
                const decoded = bs58.decode(privateKey);
                Keypair.fromSecretKey(decoded);
            } catch {
                throw new Error("Invalid Private Key (Base58)");
            }

            // Encrypt and store
            const encryptedBundle = await encryptData(privateKey, password);
            localStorage.setItem("GRIT_ENCRYPTED_WALLET", encryptedBundle);

            // Auto login after import
            sessionStorage.setItem("GRIT_SESSION_KEY", privateKey);

            window.location.reload();
        } catch (e: any) {
            setError(e.message);
        } finally {
            setLoading(false);
        }
    };

    const handleLogin = async () => {
        try {
            setError("");
            setLoading(true);

            const encrypted = localStorage.getItem("GRIT_ENCRYPTED_WALLET");
            if (!encrypted) throw new Error("No wallet found");

            const decryptedKey = await decryptData(encrypted, password);

            // Verify it's valid
            bs58.decode(decryptedKey);

            // Store in session (cleared on tab close)
            sessionStorage.setItem("GRIT_SESSION_KEY", decryptedKey);

            window.location.reload();
        } catch (e) {
            setError("Incorrect password");
        } finally {
            setLoading(false);
        }
    };

    const handleLogout = () => {
        sessionStorage.removeItem("GRIT_SESSION_KEY");
        window.location.reload();
    };

    const handleClearWallet = () => {
        if (confirm("Are you sure? This will delete the encrypted key from this device. Make sure you have a backup!")) {
            localStorage.removeItem("GRIT_ENCRYPTED_WALLET");
            sessionStorage.removeItem("GRIT_SESSION_KEY");
            window.location.reload();
        }
    };

    if (isUnlocked) {
        return (
            <div className="fixed bottom-4 right-4 z-50 flex gap-2">
                <button
                    onClick={handleLogout}
                    className="bg-purple-900/50 hover:bg-purple-900 border border-purple-500/30 text-purple-200 text-xs px-3 py-1 rounded-full backdrop-blur-sm transition-all"
                >
                    🔒 Lock Wallet
                </button>
            </div>
        );
    }

    return (
        <>
            <button
                onClick={() => setIsOpen(true)}
                className="text-xs text-zinc-500 hover:text-purple-400 underline transition-colors"
            >
                {hasEncryptedKey ? "Unlock Wallet" : "Import Private Key"}
            </button>

            {isOpen && (
                <div className="fixed inset-0 bg-black/80 flex items-center justify-center z-50 p-4">
                    <div className="bg-zinc-900 border border-purple-500/30 rounded-xl p-6 max-w-md w-full shadow-2xl shadow-purple-900/20 animate-in fade-in zoom-in duration-200">
                        <div className="flex justify-between items-start mb-4">
                            <div>
                                <h3 className="text-xl font-bold text-white">
                                    {hasEncryptedKey ? "Unlock Wallet" : "Secure Import"}
                                </h3>
                                <p className="text-zinc-400 text-xs mt-1">
                                    {hasEncryptedKey
                                        ? "Enter password to decrypt your key"
                                        : "Your key is encrypted with AES-GCM and stored locally."}
                                </p>
                            </div>
                            <button onClick={() => setIsOpen(false)} className="text-zinc-500 hover:text-white">✕</button>
                        </div>

                        {!hasEncryptedKey ? (
                            <div className="space-y-3">
                                <input
                                    type="password"
                                    placeholder="Enter Private Key (Base58)"
                                    value={privateKey}
                                    onChange={(e) => setPrivateKey(e.target.value)}
                                    className="w-full bg-black/50 border border-zinc-700 rounded-lg p-3 text-white focus:border-purple-500 outline-none font-mono text-sm"
                                />
                                <div className="grid grid-cols-2 gap-2">
                                    <input
                                        type="password"
                                        placeholder="Set Password"
                                        value={password}
                                        onChange={(e) => setPassword(e.target.value)}
                                        className="w-full bg-black/50 border border-zinc-700 rounded-lg p-3 text-white focus:border-purple-500 outline-none text-sm"
                                    />
                                    <input
                                        type="password"
                                        placeholder="Confirm"
                                        value={confirmPassword}
                                        onChange={(e) => setConfirmPassword(e.target.value)}
                                        className="w-full bg-black/50 border border-zinc-700 rounded-lg p-3 text-white focus:border-purple-500 outline-none text-sm"
                                    />
                                </div>
                            </div>
                        ) : (
                            <div className="space-y-3">
                                <input
                                    type="password"
                                    placeholder="Enter Password"
                                    value={password}
                                    onChange={(e) => setPassword(e.target.value)}
                                    onKeyDown={(e) => e.key === 'Enter' && handleLogin()}
                                    className="w-full bg-black/50 border border-zinc-700 rounded-lg p-3 text-white focus:border-purple-500 outline-none text-sm"
                                />
                            </div>
                        )}

                        {error && (
                            <div className="mt-4 p-2 bg-red-900/20 border border-red-500/30 rounded text-red-400 text-xs text-center">
                                {error}
                            </div>
                        )}

                        <div className="flex gap-3 mt-6">
                            {hasEncryptedKey && (
                                <button
                                    onClick={handleClearWallet}
                                    className="px-4 py-2 bg-red-900/20 hover:bg-red-900/40 text-red-400 rounded-lg text-xs"
                                >
                                    Reset
                                </button>
                            )}
                            <button
                                onClick={hasEncryptedKey ? handleLogin : handleImport}
                                disabled={loading}
                                className="flex-1 py-2 bg-purple-600 hover:bg-purple-500 text-white font-bold rounded-lg disabled:opacity-50 disabled:cursor-not-allowed transition-all"
                            >
                                {loading ? "Processing..." : (hasEncryptedKey ? "Unlock" : "Encrypt & Import")}
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </>
    );
}
