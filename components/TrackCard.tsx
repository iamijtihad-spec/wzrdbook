"use client";

import Image from "next/image";
import { useState } from "react";

interface TrackCardProps {
    title: string;
    imageFile: string;
    audioFile: string;
    rarity: string;
    price: number;
    isOwned: boolean;
    onPlay: () => void;
}

export default function TrackCard({
    title,
    imageFile,
    rarity,
    price,
    isOwned,
    onPlay,
}: TrackCardProps) {
    const [isHovered, setIsHovered] = useState(false);

    const getRarityColor = (rarity: string) => {
        switch (rarity.toLowerCase()) {
            case "legendary":
                return "from-yellow-400 via-orange-500 to-red-500";
            case "epic":
                return "from-purple-400 via-pink-500 to-purple-600";
            case "rare":
                return "from-blue-400 via-cyan-500 to-blue-600";
            default:
                return "from-gray-400 to-gray-600";
        }
    };

    const getRarityGlow = (rarity: string) => {
        switch (rarity.toLowerCase()) {
            case "legendary":
                return "shadow-yellow-500/50";
            case "epic":
                return "shadow-purple-500/50";
            case "rare":
                return "shadow-blue-500/50";
            default:
                return "shadow-gray-500/30";
        }
    };

    return (
        <div
            className={`relative group cursor-pointer transform transition-all duration-500 hover:scale-105 ${isOwned ? "" : "grayscale-[30%]"
                }`}
            onMouseEnter={() => setIsHovered(true)}
            onMouseLeave={() => setIsHovered(false)}
            onClick={isOwned ? onPlay : undefined}
        >
            {/* Card Container */}
            <div
                className={`relative overflow-hidden rounded-2xl border-2 ${isOwned
                    ? `border-transparent bg-gradient-to-r p-[2px] ${getRarityColor(rarity)}`
                    : "border-gray-700"
                    } shadow-xl ${isOwned ? `shadow-lg ${getRarityGlow(rarity)}` : ""}`}
            >
                <div className="bg-gray-900 rounded-xl overflow-hidden">
                    {/* Image */}
                    <div className="relative aspect-square overflow-hidden">
                        <Image
                            src={`/images/${imageFile}`}
                            alt={title}
                            fill
                            className={`object-cover transition-transform duration-500 ${isHovered ? "scale-110" : "scale-100"
                                }`}
                        />

                        {/* Lock Overlay */}
                        {!isOwned && (
                            <div className="absolute inset-0 bg-black/60 flex items-center justify-center">
                                <div className="text-center">
                                    <span className="text-4xl">🔒</span>
                                    <p className="text-white font-bold mt-2">{price} GRIT</p>
                                </div>
                            </div>
                        )}

                        {/* Play Overlay */}
                        {isOwned && isHovered && (
                            <div className="absolute inset-0 bg-black/50 flex items-center justify-center transition-opacity">
                                <div
                                    className={`w-20 h-20 rounded-full bg-gradient-to-r ${getRarityColor(
                                        rarity
                                    )} flex items-center justify-center animate-pulse`}
                                >
                                    <span className="text-4xl ml-1">▶</span>
                                </div>
                            </div>
                        )}

                        {/* Rarity Badge */}
                        <div
                            className={`absolute top-3 right-3 px-3 py-1 rounded-full text-xs font-bold text-white bg-gradient-to-r ${getRarityColor(
                                rarity
                            )} shadow-lg`}
                        >
                            {rarity.toUpperCase()}
                        </div>

                        {/* Owned Badge */}
                        {isOwned && (
                            <div className="absolute top-3 left-3 px-2 py-1 bg-green-500 rounded-full text-xs font-bold text-white">
                                ✓ OWNED
                            </div>
                        )}
                    </div>

                    {/* Info */}
                    <div className="p-4">
                        <h3 className="font-bold text-white text-lg truncate">{title}</h3>
                        <div className="flex items-center justify-between mt-2">
                            <span className="text-gray-400 text-sm">WZRD</span>
                            {isOwned ? (
                                <span className="text-green-400 text-sm font-medium">
                                    🎵 Play Now
                                </span>
                            ) : (
                                <span className="text-gray-500 text-sm">{price} GRIT</span>
                            )}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
