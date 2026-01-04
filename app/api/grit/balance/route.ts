import { NextRequest, NextResponse } from "next/server";
import { Connection, PublicKey } from "@solana/web3.js";
import { getAssociatedTokenAddress, getAccount, getMint } from "@solana/spl-token";

import { TOKEN_MINTS, RPC_URL } from "@/constants/tokens";

const GRIT_MINT = TOKEN_MINTS.GRIT;
const SOLANA_RPC = RPC_URL;

export async function GET(request: NextRequest) {
    try {
        const { searchParams } = new URL(request.url);
        const walletAddress = searchParams.get("wallet");

        if (!walletAddress) {
            return NextResponse.json(
                { error: "Wallet address is required" },
                { status: 400 }
            );
        }

        // Validate wallet address
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
        const mintPubkey = new PublicKey(GRIT_MINT);

        try {
            const ata = await getAssociatedTokenAddress(mintPubkey, walletPubkey);
            const tokenAccount = await getAccount(connection, ata);
            const mintInfo = await getMint(connection, mintPubkey);

            const balance = Number(tokenAccount.amount) / Math.pow(10, mintInfo.decimals);

            return NextResponse.json({
                wallet: walletAddress,
                balance,
                mint: GRIT_MINT,
            });
        } catch {
            // Token account doesn't exist
            return NextResponse.json({
                wallet: walletAddress,
                balance: 0,
                mint: GRIT_MINT,
            });
        }

    } catch (error) {
        console.error("Error fetching GRIT balance:", error);
        return NextResponse.json(
            { error: "Failed to fetch balance" },
            { status: 500 }
        );
    }
}
