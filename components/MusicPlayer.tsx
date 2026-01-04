"use client";

import { useWallet } from "@solana/wallet-adapter-react";
import { useState, useRef, useEffect } from "react";
import { Play, Pause, Volume2, VolumeX } from "lucide-react";

interface MusicPlayerProps {
    trackKey: string;
    trackName: string;
}

export default function MusicPlayer({ trackKey, trackName }: MusicPlayerProps) {
    const { publicKey } = useWallet();
    const [isPlaying, setIsPlaying] = useState(false);
    const [isMuted, setIsMuted] = useState(false);
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [audioUrl, setAudioUrl] = useState<string | null>(null);
    const audioRef = useRef<HTMLAudioElement>(null);

    const fetchAudioUrl = async () => {
        if (!publicKey) {
            setError("Please connect your wallet");
            return;
        }

        setIsLoading(true);
        setError(null);

        try {
            const response = await fetch("/api/music", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    walletAddress: publicKey.toBase58(),
                    trackKey,
                }),
            });

            if (!response.ok) {
                const data = await response.json();
                throw new Error(data.error || "Failed to load track");
            }

            const data = await response.json();
            setAudioUrl(data.url);
        } catch (err: unknown) {
            setError(err instanceof Error ? err.message : "Failed to load track");
        } finally {
            setIsLoading(false);
        }
    };

    const togglePlay = async () => {
        if (!audioUrl) {
            await fetchAudioUrl();
            return;
        }

        if (audioRef.current) {
            if (isPlaying) {
                audioRef.current.pause();
            } else {
                audioRef.current.play();
            }
            setIsPlaying(!isPlaying);
        }
    };

    const toggleMute = () => {
        if (audioRef.current) {
            audioRef.current.muted = !isMuted;
            setIsMuted(!isMuted);
        }
    };

    useEffect(() => {
        const audio = audioRef.current;
        if (!audio) return;

        const handleEnded = () => setIsPlaying(false);
        const handlePlay = () => setIsPlaying(true);
        const handlePause = () => setIsPlaying(false);

        audio.addEventListener("ended", handleEnded);
        audio.addEventListener("play", handlePlay);
        audio.addEventListener("pause", handlePause);

        return () => {
            audio.removeEventListener("ended", handleEnded);
            audio.removeEventListener("play", handlePlay);
            audio.removeEventListener("pause", handlePause);
        };
    }, []);

    return (
        <div className="bg-zinc-900 border border-zinc-800 rounded-lg p-4 flex items-center gap-4">
            <button
                onClick={togglePlay}
                disabled={isLoading}
                className="w-12 h-12 rounded-full bg-orange-600 hover:bg-orange-500 disabled:bg-zinc-700 flex items-center justify-center transition-colors"
            >
                {isLoading ? (
                    <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                ) : isPlaying ? (
                    <Pause className="w-5 h-5 text-white" />
                ) : (
                    <Play className="w-5 h-5 text-white ml-0.5" />
                )}
            </button>

            <div className="flex-1">
                <h4 className="text-white font-bold">{trackName}</h4>
                {error && <p className="text-red-400 text-sm">{error}</p>}
            </div>

            <button
                onClick={toggleMute}
                className="w-10 h-10 rounded-full bg-zinc-800 hover:bg-zinc-700 flex items-center justify-center transition-colors"
            >
                {isMuted ? (
                    <VolumeX className="w-5 h-5 text-zinc-400" />
                ) : (
                    <Volume2 className="w-5 h-5 text-zinc-400" />
                )}
            </button>

            {audioUrl && (
                <audio ref={audioRef} src={audioUrl} preload="metadata" />
            )}
        </div>
    );
}
