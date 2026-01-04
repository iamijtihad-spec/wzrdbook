import nftConfig from '@/config/nfts.json';

export interface NFTTrack {
    title: string;
    mint: string;
    price: number;
    rarity: string;
    metadataFile: string;
    imageFile: string;
    audioFile: string;
    symbol: string;
}

export interface NFTConfig {
    tracks: NFTTrack[];
}

/**
 * Get all NFT tracks from config
 */
export function getAllTracks(): NFTTrack[] {
    return nftConfig.tracks;
}

/**
 * Get track mints as a map (title -> mint address)
 */
export function getTrackMints(): Record<string, string> {
    return nftConfig.tracks.reduce((acc, track) => {
        acc[track.title] = track.mint;
        return acc;
    }, {} as Record<string, string>);
}

/**
 * Get NFT prices as a map (mint address -> price)
 */
export function getNFTPrices(): Record<string, number> {
    return nftConfig.tracks.reduce((acc, track) => {
        acc[track.mint] = track.price;
        return acc;
    }, {} as Record<string, number>);
}

/**
 * Get track by mint address
 */
export function getTrackByMint(mint: string): NFTTrack | undefined {
    return nftConfig.tracks.find(track => track.mint === mint);
}

/**
 * Get track by title
 */
export function getTrackByTitle(title: string): NFTTrack | undefined {
    return nftConfig.tracks.find(track => track.title === title);
}
