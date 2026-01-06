import { NextRequest, NextResponse } from "next/server";
import { Connection, PublicKey } from "@solana/web3.js";
import { getAssociatedTokenAddress, getAccount } from "@solana/spl-token";
import artistConfig from "@/config/artist.json";
import { TOKEN_MINTS, RPC_URL } from "@/constants/tokens";

export async function GET(req: NextRequest) {
    const { searchParams } = new URL(req.url);
    const wallet = searchParams.get("wallet");

    if (!wallet) {
        return NextResponse.json({ success: false, error: "Wallet required" }, { status: 400 });
    }

    try {
        const connection = new Connection(RPC_URL, "confirmed");
        const mint = new PublicKey(TOKEN_MINTS.CHI);
        const owner = new PublicKey(wallet);

        const ata = await getAssociatedTokenAddress(mint, owner);

        try {
            const tokenAccount = await getAccount(connection, ata);
            const balance = Number(tokenAccount.amount) / 1_000_000_000; // Assuming 9 decimals
            return NextResponse.json({ success: true, balance });
        } catch (e) {
            // ATA doesn't exist = 0 balance
            return NextResponse.json({ success: true, balance: 0 });
        }

    } catch (error: any) {
        return NextResponse.json({ success: false, error: error.message }, { status: 500 });
    }
}


export const runtime = 'edge';