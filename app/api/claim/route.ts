import { NextRequest, NextResponse } from "next/server";
import { Connection, PublicKey } from "@solana/web3.js";
import { getAssociatedTokenAddress, getAccount, getMint } from "@solana/spl-token";
import { getAllTracks } from "@/lib/nft-config";
import { getClaims, addClaim } from "@/lib/claim-store";

const GRIT_MINT = process.env.GRIT_MINT || "CS8ZQMdJ5t5hNuM51LXJBU4zBysZWAkFj9oJ6MwtnHsS";
const SOLANA_RPC = process.env.SOLANA_RPC_URL || "https://api.devnet.solana.com";

export async function GET(request: NextRequest) {
    try {
        const wallet = request.nextUrl.searchParams.get("wallet");

        if (!wallet) {
            return NextResponse.json(
                { error: "Wallet address required" },
                { status: 400 }
            );
        }

        // 1. Get GRIT Balance
        let gritBalance = 0;
        try {
            const connection = new Connection(SOLANA_RPC);
            const mintPubkey = new PublicKey(GRIT_MINT);
            const walletPubkey = new PublicKey(wallet);
            const ata = await getAssociatedTokenAddress(mintPubkey, walletPubkey);
            const tokenAccount = await getAccount(connection, ata);
            const mintInfo = await getMint(connection, mintPubkey);
            gritBalance = Number(tokenAccount.amount) / Math.pow(10, mintInfo.decimals);
        } catch (e) {
            console.error("Error checking GRIT balance:", e);
            // Fallback: if we can't check balance, assume 0 (or allow for testing if needed)
        }

        // 2. Get Existing Claims
        const existingClaims = getClaims(wallet);
        const claimedIds = new Set(existingClaims.map(c => c.claimId));

        // 3. Determine Available Claims
        // Check eligibility for each track based on its price and user's GRIT balance
        const allTracks = getAllTracks();
        const claimables: any[] = [];

        for (const track of allTracks) {
            const isClaimed = claimedIds.has(track.mint);
            let status = "locked";

            if (isClaimed) {
                status = "claimed";
            } else if (gritBalance >= track.price) {
                status = "available";
            }

            // Always include the track so the UI can show locked items
            claimables.push({
                id: track.mint,
                type: "nft",
                nftTitle: track.title,
                nftMint: track.mint,
                imageFile: track.imageFile,
                price: track.price,
                rarity: track.rarity,
                status: status
            });
        }

        return NextResponse.json({
            claimables,
            gritBalance
        });

    } catch (error) {
        console.error("Error fetching claimables:", error);
        return NextResponse.json(
            { error: "Failed to fetch claimables" },
            { status: 500 }
        );
    }
}

export async function POST(request: NextRequest) {
    try {
        const body = await request.json();
        const { wallet, claimId } = body;

        if (!wallet || !claimId) {
            return NextResponse.json(
                { error: "Wallet and claimId required" },
                { status: 400 }
            );
        }

        // In a real app, we would verify eligibility again here
        // For now, we trust the flow and just record the claim
        // simulating a successful "mint" or "airdrop"

        const success = addClaim(wallet, claimId);

        if (success) {
            return NextResponse.json({
                success: true,
                message: "Claim processed successfully",
                signature: "SIMULATED_TX_" + Date.now(),
            });
        } else {
            return NextResponse.json(
                { error: "Already claimed or failed to save" },
                { status: 400 }
            );
        }

    } catch (error) {
        console.error("Error processing claim:", error);
        return NextResponse.json(
            { error: "Failed to process claim" },
            { status: 500 }
        );
    }
}
