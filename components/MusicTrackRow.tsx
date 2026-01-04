"use client";

import Image from "next/image";

// import { useState } from "react";

interface MusicTrackRowProps {
    title: string;
    imageFile: string;
    artist?: string;
    isOwned: boolean;
    onPlay: () => void;
    isPlaying?: boolean;
}

export default function MusicTrackRow({
    title,
    imageFile,
    artist = "WZRD",
    isOwned,
    onPlay,
    isPlaying = false,
}: MusicTrackRowProps) {
    // const [isHovered, setIsHovered] = useState(false);

    return (
        <div
            className={`group flex items-center p-4 rounded-xl transition-all duration-300 border border-transparent mb-2 ${isOwned
                ? "hover:bg-white/5 cursor-pointer hover:border-purple-500/20 hover:shadow-lg hover:shadow-purple-900/10"
                : "opacity-60 grayscale hover:opacity-80 hover:grayscale-0"
                } ${isPlaying ? "bg-white/5 border-purple-500/30 shadow-[0_0_20px_rgba(168,85,247,0.1)]" : ""}`}
            onClick={isOwned ? onPlay : undefined}
        >
            {/* Play/Index Column */}
            < div className="w-12 flex justify-center items-center mr-6" >
                <button
                    onClick={(e) => {
                        e.stopPropagation();
                        if (isOwned) onPlay();
                    }}
                    className={`
                        w-12 h-12 rounded-full flex items-center justify-center transition-all duration-500
                        ${isPlaying
                            ? 'bg-gradient-to-br from-purple-600 to-blue-600 text-white shadow-[0_0_20px_rgba(168,85,247,0.6)] scale-110'
                            : isOwned
                                ? 'bg-white/5 text-white border border-white/10 group-hover:border-purple-500/50 group-hover:scale-110 group-hover:shadow-[0_0_15px_rgba(168,85,247,0.3)]'
                                : 'bg-black/40 text-gray-600 cursor-not-allowed border border-white/5'
                        }
                    `}
                    disabled={!isOwned}
                >
                    {isPlaying ? (
                        <div className="flex gap-[2px] h-4 items-end">
                            <div className="w-1 bg-white animate-[pulse_0.6s_ease-in-out_infinite]" />
                            <div className="w-1 bg-white animate-[pulse_0.8s_ease-in-out_infinite]" />
                            <div className="w-1 bg-white animate-[pulse_1s_ease-in-out_infinite]" />
                        </div>
                    ) : isOwned ? (
                        <span className="ml-1 text-lg">▶</span>
                    ) : (
                        <span className="text-sm">🔒</span>
                    )}
                </button>
            </div >

            {/* Album Art */}
            < div className={`relative w-14 h-14 rounded-lg overflow-hidden mr-6 shadow-xl transition-transform duration-500 ${isPlaying ? 'rotate-[360deg] duration-[10s] linear infinite' : 'group-hover:scale-105'}`}>
                <Image
                    src={`/images/${imageFile}`}
                    alt={title}
                    fill
                    className="object-cover"
                />
            </div >

            {/* Track Info */}
            < div className="flex-grow min-w-0 mr-4" >
                <h3 className={`font-bold text-lg truncate transition-all ${isPlaying ? "text-transparent bg-clip-text bg-gradient-to-r from-purple-400 to-blue-400 drop-shadow-[0_0_10px_rgba(168,85,247,0.3)]" : "text-white group-hover:text-purple-300"}`}>
                    {title}
                </h3>
                <div className="flex items-center gap-2">
                    <span className="text-sm text-gray-400 font-medium">{artist}</span>
                    {isPlaying && <span className="px-2 py-0.5 rounded-full bg-purple-500/20 text-purple-300 text-[10px] border border-purple-500/20 font-bold uppercase tracking-wider animate-pulse">Now Playing</span>}
                </div>
            </div >

            {/* Right Action */}
            < div className="hidden sm:flex items-center text-gray-500 text-sm min-w-[80px] justify-end" >
                {
                    isOwned ? (
                        <span className="opacity-0 group-hover:opacity-100 transition-all duration-300 text-xs font-bold uppercase tracking-widest text-purple-400 bg-purple-500/10 px-3 py-1 rounded border border-purple-500/20" >
                            Play
                        </span>
                    ) : (
                        <span className="text-[10px] font-bold uppercase tracking-widest bg-gray-900 border border-gray-700 rounded px-2 py-1 text-gray-500">
                            Locked
                        </span>
                    )}
            </div >
        </div >
    );
}
