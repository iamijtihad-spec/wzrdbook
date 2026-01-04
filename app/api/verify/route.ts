import { NextRequest, NextResponse } from "next/server";
import { PublicKey } from "@solana/web3.js";
import nacl from "tweetnacl";
import bs58 from "bs58";

// Mock Database (In-memory for demo)
const VERIFIED_WALLETS = new Map<string, string>();

export async function POST(req: NextRequest) {
    try {
        const body = await req.json();
        const { discordId, walletAddress, signature, message } = body;

        if (!discordId || !walletAddress || !signature || !message) {
            return NextResponse.json({ error: "Missing parameters" }, { status: 400 });
        }

        // Verify Signature
        const msgBytes = new TextEncoder().encode(message);
        const sigBytes = bs58.decode(signature);
        const pubKeyBytes = new PublicKey(walletAddress).toBytes();

        const verified = nacl.sign.detached.verify(msgBytes, sigBytes, pubKeyBytes);

        if (!verified) {
            return NextResponse.json({ error: "Invalid signature" }, { status: 401 });
        }

        // Simulate DB Update
        const timestamp = Date.now();
        console.log(`[VERIFY] Linked Discord ${discordId} to Wallet ${walletAddress} at ${timestamp}`);
        VERIFIED_WALLETS.set(discordId, walletAddress);

        return NextResponse.json({
            success: true,
            message: "Identity Verified",
            user: {
                discordId,
                wallet: walletAddress,
                roles: ["Verified", "Holder"] // Assigned Identity Baseline
            }
        });

    } catch (e: any) {
        console.error(e);
        return NextResponse.json({ error: "Verification Failed" }, { status: 500 });
    }
}
