import { NextResponse } from "next/server";
import { getAllTracks } from "@/lib/nft-config";
import { scanLocalAudio } from "@/lib/server/audio-scanner";

export async function GET() {
    try {
        const configTracks = getAllTracks();
        const localTracks = scanLocalAudio();

        // Use local tracks instead of config if config doesn't match uploads, 
        // OR merge them. 
        // Given the user said "allow easy uploads... not connected to NFTs", 
        // we should PRIORITIZE the local scan as the "Playlist".
        // Let's return local tracks FIRST, then config tracks (deduplicated by title if needed).

        // Simple merge:
        // Deduplicate: If a local track exists with the same title, use it (it has the audio file).
        // Otherwise, include the config track (which might be an NFT without a local file yet, or remote).
        const localTitles = new Set(localTracks.map(t => t.title.toLowerCase())); // Case-insensitive check

        const uniqueConfigTracks = configTracks.filter(
            t => !localTitles.has(t.title.toLowerCase())
        );

        const allTracks = [...localTracks, ...uniqueConfigTracks];

        return NextResponse.json({
            tracks: allTracks,
            source: "mixed"
        });
    } catch (error) {
        console.error("Error fetching track list:", error);
        return NextResponse.json(
            { error: "Failed to fetch tracks" },
            { status: 500 }
        );
    }
}
