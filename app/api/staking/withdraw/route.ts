import { NextResponse } from "next/server";
import { Connection, Keypair, PublicKey, Transaction, sendAndConfirmTransaction } from "@solana/web3.js";
import { getAssociatedTokenAddress, createTransferInstruction, getOrCreateAssociatedTokenAccount } from "@solana/spl-token";
import fs from "fs";
import path from "path";

// Initialize Connection
const connection = new Connection(process.env.NEXT_PUBLIC_SOLANA_RPC_URL || "https://api.devnet.solana.com", "confirmed");

// Load Token Constants dynamically or use hardcoded for now as quick fix to avoid import issues
// Using MOXY Mint
const MOXY_MINT = new PublicKey("2FFhBNoCqsgXejrqQXk3gJXWyG9nuiE7qj4Sv2wrcnwq");

export async function POST(req: Request) {
    try {
        const body = await req.json();
        const { wallet } = body; // User Wallet to withdraw to

        if (!wallet) return NextResponse.json({ error: "Missing wallet" }, { status: 400 });

        // 1. Load Storage
        const { StorageEngine } = await import("@/lib/server/storage");
        const env = (process as any).env;

        let withdrawnAmount = 0;
        let penaltyAmount = 0;

        // 2. Process Withdraw (Atomic Update)
        await StorageEngine.update<any[]>(
            "stakes",
            (stakes) => {
                if (!Array.isArray(stakes)) return [];

                // Find all active stakes for this user
                const userActiveStakes = stakes.filter((s: any) => s.wallet === wallet && s.status === 'Active');

                if (userActiveStakes.length === 0) {
                    throw new Error("No active stakes found");
                }

                return stakes.map((s: any) => {
                    if (s.wallet === wallet && s.status === 'Active') {
                        // Logic: Check Lock Period
                        const now = Date.now();
                        const isMature = now >= (s.start_time + s.lock_period);

                        let returnAmt = s.amount;

                        if (!isMature) {
                            // Penalty: 10%
                            const penalty = s.amount * 0.10;
                            returnAmt -= penalty;
                            penaltyAmount += penalty;
                        } else {
                            // Reward? For now just return principal. 
                            // TODO: Add Rewards Logic
                        }

                        withdrawnAmount += returnAmt;
                        return { ...s, status: 'Withdrawn', withdraw_time: now };
                    }
                    return s;
                });
            },
            [],
            env
        );

        if (withdrawnAmount <= 0) {
            return NextResponse.json({ error: "Nothing to withdraw" }, { status: 400 });
        }

        // 3. Initiate Blockchain Transfer (Treasury -> User)
        const secretPath = path.join(process.cwd(), "secrets/staking-wallet.json");
        if (!fs.existsSync(secretPath)) {
            throw new Error("Treasury Wallet not found on server");
        }
        const secret = JSON.parse(fs.readFileSync(secretPath, "utf-8"));
        const treasuryKeypair = Keypair.fromSecretKey(Uint8Array.from(secret));

        // Get ATAs
        const fromAta = await getOrCreateAssociatedTokenAccount(
            connection,
            treasuryKeypair,
            MOXY_MINT,
            treasuryKeypair.publicKey
        );

        const toAta = await getOrCreateAssociatedTokenAccount(
            connection,
            treasuryKeypair, // Payer
            MOXY_MINT,
            new PublicKey(wallet)
        );

        const amountLamports = BigInt(Math.floor(withdrawnAmount * 1_000_000_000));

        const tx = new Transaction().add(
            createTransferInstruction(
                fromAta.address,
                toAta.address,
                treasuryKeypair.publicKey,
                amountLamports
            )
        );

        const signature = await sendAndConfirmTransaction(connection, tx, [treasuryKeypair]);

        return NextResponse.json({ success: true, signature, amount: withdrawnAmount, penalty: penaltyAmount });

    } catch (e: any) {
        console.error("Withdraw Error:", e);
        return NextResponse.json({ error: e.message }, { status: 500 });
    }
}
