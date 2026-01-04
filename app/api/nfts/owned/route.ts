import { NextRequest, NextResponse } from "next/server";
import { Connection, PublicKey } from "@solana/web3.js";
import { getAssociatedTokenAddress, getAccount, getMint } from "@solana/spl-token";
import { getAllTracks } from "@/lib/nft-config";
import { getClaims } from "@/lib/claim-store";

// Solana RPC endpoint
const SOLANA_RPC = process.env.SOLANA_RPC_URL || "https://api.devnet.solana.com";

export const dynamic = 'force-dynamic'; // Disable caching

export async function GET(request: NextRequest) {
    try {
        const { searchParams } = new URL(request.url);
        const walletAddress = searchParams.get("wallet");
        console.log(`🔍 Checking NFTs for: ${walletAddress}`);

        if (!walletAddress) {
            return NextResponse.json(
                { error: "Wallet address required" },
                { status: 400 }
            );
        }

        let walletPubkey: PublicKey;
        try {
            walletPubkey = new PublicKey(walletAddress);
        } catch {
            return NextResponse.json(
                { error: "Invalid wallet address" },
                { status: 400 }
            );
        }

        const connection = new Connection(SOLANA_RPC);

        // Fetch all token accounts for the wallet
        const tokenAccounts = await connection.getParsedTokenAccountsByOwner(walletPubkey, {
            programId: new PublicKey("TokenkegQfeZyiNwAJbNbGKPFXCWuBvf9Ss623VQ5DA"),
        });

        const ownedNFTs = [];
        const allConfiguredTracks = getAllTracks();
        const configuredMints = new Set(allConfiguredTracks.map(t => t.mint));

        // Helper Map for configured tracks
        const trackMap = new Map(allConfiguredTracks.map(t => [t.mint, t]));

        for (const { account } of tokenAccounts.value) {
            const amount = account.data.parsed.info.tokenAmount.amount;
            const decimals = account.data.parsed.info.tokenAmount.decimals;

            // Check if it's an NFT (amount 1, decimals 0)
            if (amount === "1" && decimals === 0) {
                const mintAddress = account.data.parsed.info.mint;

                // 1. Check if it's in our static config (Grit Music)
                if (configuredMints.has(mintAddress)) {
                    const track = trackMap.get(mintAddress);
                    if (track) { // Ensure track exists before pushing
                        ownedNFTs.push(track);
                    }
                    continue;
                }

                // 2. If NOT in config, treat as Dynamic NFT (Birth Chart / Other)
                // Since we can't easily parse Metadata without the library here, we add as a generic item.
                // In a real app, we would use Metaplex SDK to fetch name/image.
                ownedNFTs.push({
                    mint: mintAddress,
                    title: "Cosmic Chart / Rare Item",
                    imageFile: "wzrd_cd.png", // Placeholder
                    audioFile: "",
                    rarity: "Unique",
                    price: 0,
                    isDynamic: true
                });
            }
        }

        return NextResponse.json({
            wallet: walletAddress,
            ownedNFTs,
            count: ownedNFTs.length,
        });

    } catch (error) {
        console.error("Error fetching owned NFTs:", error);
        return NextResponse.json(
            { error: "Failed to fetch owned NFTs" },
            { status: 500 }
        );
    }
}
