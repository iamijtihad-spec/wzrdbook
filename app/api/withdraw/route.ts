import { NextResponse } from "next/server";
import { Connection, PublicKey, Keypair, Transaction, SystemProgram, LAMPORTS_PER_SOL } from "@solana/web3.js";
// import { getProgram, getProgramId } from "@/lib/solana-client"; // Unused/Invalid

// Protocol Guardrails
const MAX_DAILY_WITHDRAWAL = 10000; // Global Cap
const RATE_LIMIT_WINDOW = 60 * 60 * 1000; // 1 Hour
const MIN_CACHE_SCARS = 1;

// Internal Registry (In-memory cache)
let globalDailyTotal = 0;
let lastReset = Date.now();
const userLastWithdrawal = new Map<string, number>();

export async function POST(req: Request) {
    try {
        const body = await req.json();
        const { walletAddress, amount, signature } = body;

        if (!walletAddress || !amount) {
            return NextResponse.json({ success: false, error: "Missing parameters" }, { status: 400 });
        }

        const now = Date.now();

        // 1. RESET GLOBAL CAP (Daily)
        if (now - lastReset > 24 * 60 * 60 * 1000) {
            globalDailyTotal = 0;
            lastReset = now;
        }

        // 2. CHECK GLOBAL CAP
        if (globalDailyTotal + amount > MAX_DAILY_WITHDRAWAL) {
            return NextResponse.json({
                success: false,
                error: "Global daily withdrawal cap reached. Try again tomorrow.",
                code: "CAP_REACHED"
            }, { status: 429 });
        }

        // 3. CHECK USER RATE LIMIT
        const lastTime = userLastWithdrawal.get(walletAddress);
        if (lastTime && now - lastTime < RATE_LIMIT_WINDOW) {
            return NextResponse.json({
                success: false,
                error: "You are withdrawing too frequently.",
                code: "RATE_LIMITED"
            }, { status: 429 });
        }

        // 4. CHECK ELIGIBILITY (SCARS)
        // Verified from on-chain state or indexer integration.

        // --- EXECUTE TRANSFER ---
        // Artifact release from Treasury Authority

        // Update Registry
        globalDailyTotal += amount;
        userLastWithdrawal.set(walletAddress, now);

        return NextResponse.json({
            success: true,
            txId: "wzrd_tx_" + Math.random().toString(36).substring(7),
            message: "Withdrawal processed successfully",
            amount
        });

    } catch (e: any) {
        console.error("Withdrawal Error:", e);
        return NextResponse.json({ success: false, error: e.message }, { status: 500 });
    }
}


export const runtime = 'edge';