import { NextRequest, NextResponse } from "next/server";
import { Connection, PublicKey } from "@solana/web3.js";

const SOLANA_RPC = process.env.SOLANA_RPC_URL || "https://api.devnet.solana.com";

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

        try {
            const balance = await connection.getBalance(walletPubkey);

            return NextResponse.json({
                wallet: walletAddress,
                balance: balance / 1e9, // Convert lamports to SOL
                lamports: balance,
            });
        } catch {
            return NextResponse.json({
                wallet: walletAddress,
                balance: 0,
                lamports: 0,
            });
        }

    } catch (error) {
        console.error("Error fetching SOL balance:", error);
        return NextResponse.json(
            { error: "Failed to fetch balance" },
            { status: 500 }
        );
    }
}
