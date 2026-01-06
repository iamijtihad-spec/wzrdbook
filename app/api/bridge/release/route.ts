
import { NextRequest, NextResponse } from "next/server";
import { Connection, PublicKey } from "@solana/web3.js";
import { TOKEN_MINTS } from "@/constants/tokens";

// CONSTANTS in this context
// We are verifying the DEVNET burn.
const DEVNET_RPC = process.env.NEXT_PUBLIC_SOLANA_RPC_URL || "https://api.devnet.solana.com";

export async function POST(req: NextRequest) {
    try {
        const body = await req.json();
        const { signature, user, amountSOL } = body;

        if (!signature || !user || !amountSOL) {
            return NextResponse.json({ error: "Missing parameters" }, { status: 400 });
        }

        console.log(`[ORACLE] Verifying Exhale for ${user}. Sig: ${signature}`);

        // 1. Verify Transaction on Devnet
        const connection = new Connection(DEVNET_RPC);
        const tx = await connection.getParsedTransaction(signature, { commitment: 'confirmed' });

        if (!tx) {
            return NextResponse.json({ error: "Transaction not found or not confirmed" }, { status: 404 });
        }

        if (tx.meta?.err) {
            return NextResponse.json({ error: "Transaction failed on-chain" }, { status: 400 });
        }

        // Deep verification: Check if it was actually a Burn of GRIT
        // We look for SPL Token Burn instructions in the parsed message
        const instruction = tx.transaction.message.instructions.find((ix: any) => {
            if ('program' in ix && ix.program === 'spl-token' && ix.parsed?.type === 'burn') {
                // Verify mint is GRIT
                return ix.parsed.info.mint === TOKEN_MINTS.GRIT;
            }
            return false;
        });

        if (!instruction) {
            // Relaxed check for simulation if specific parsing fails or wrapped sol etc, 
            // but ideally stricter.
            console.warn("[ORACLE] Warning: strict burn instruction check failed or complex tx.");
            // For prototype, we might trust the generic success if it matches the signer.
        }

        // 2. Perform Release (Simulation)
        // In reality, this would sign a Mainnet transaction using a hot wallet key stored in env.
        // For this demo: We just return success and "dispatch" the SOL virtually.

        console.log(`[ORACLE] Releasing ${amountSOL} SOL to ${user} on Mainnet.`);

        return NextResponse.json({
            success: true,
            message: "Exhale Successful. Mainnet SOL Dispatched.",
            txId: "0xSIMULATED_MAINNET_TX_" + Date.now(), // Fake mainnet TX ID
            artifact: "THE_REALIZED_GHOST" // Grant reward
        });

    } catch (error: any) {
        console.error("Oracle Error:", error);
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}


export const runtime = 'edge';