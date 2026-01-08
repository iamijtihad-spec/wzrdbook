import { NextRequest, NextResponse } from "next/server";
import { Connection, Keypair, PublicKey, Transaction, clusterApiUrl } from "@solana/web3.js";
import { getAssociatedTokenAddress, createAssociatedTokenAccountInstruction, createTransferInstruction, getMint } from "@solana/spl-token";


// Config
const GRIT_MINT = process.env.GRIT_MINT || "CS8ZQMdJ5t5hNuM51LXJBU4zBysZWAkFj9oJ6MwtnHsS";
const REWARD_AMOUNT = 5; // GRIT per stream
const RPC_URL = process.env.NEXT_PUBLIC_SOLANA_RPC_URL || clusterApiUrl("devnet");

export async function POST(request: NextRequest) {
    try {
        const body = await request.json();
        const { wallet, mint, title } = body;

        if (!wallet || !mint) {
            return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
        }

        // Prevent abuse: Basic check (Real implementation needs DB cooldowns)
        // For prototype, we trust the client triggers (50% playback)

        // 1. Load Treasury Wallet
        // Logic adapted from scripts/airdrop_grit.js
        let treasury: Keypair;
        let isSimulation = false;

        if (process.env.TREASURY_SECRET) {
            try {
                const secretKey = JSON.parse(process.env.TREASURY_SECRET);
                treasury = Keypair.fromSecretKey(new Uint8Array(secretKey));
            } catch (e) {
                console.error("Failed to load treasury wallet from Env:", e);
                isSimulation = true;
            }
        } else {
            console.warn("Treasury wallet (TREASURY_SECRET) not found. Running in SIMULATION mode.");
            isSimulation = true;
        }

        if (isSimulation) {
            // Return success for UI feedback even if backend isn't funded
            return NextResponse.json({
                success: true,
                simulated: true,
                message: "Reward Pending (Simulation Mode)",
                amount: REWARD_AMOUNT,
                tx: "simulated_tx_" + Date.now()
            });
        }

        // 2. Execute Transfer (Real Mode)
        const connection = new Connection(RPC_URL, "confirmed");
        const mintPubkey = new PublicKey(GRIT_MINT);
        const recipientPubkey = new PublicKey(wallet);
        // @ts-ignore - treasury is assigned above if !isSimulation
        const treasuryPubkey = treasury.publicKey;

        // Get Decimals
        const mintInfo = await getMint(connection, mintPubkey);
        const amount = REWARD_AMOUNT * Math.pow(10, mintInfo.decimals);

        // Get ATAs
        const treasuryATA = await getAssociatedTokenAddress(mintPubkey, treasuryPubkey);
        const recipientATA = await getAssociatedTokenAddress(mintPubkey, recipientPubkey);

        const transaction = new Transaction();

        // Check if recipient ATA exists
        const accountInfo = await connection.getAccountInfo(recipientATA);
        if (!accountInfo) {
            transaction.add(
                createAssociatedTokenAccountInstruction(
                    treasuryPubkey,
                    recipientATA,
                    recipientPubkey,
                    mintPubkey
                )
            );
        }

        // Transfer
        transaction.add(
            createTransferInstruction(
                treasuryATA,
                recipientATA,
                treasuryPubkey,
                amount
            )
        );

        // Sign and Send
        // @ts-ignore
        const signature = await connection.sendTransaction(transaction, [treasury]);

        // Don't wait for confirmation to keep UI snappy, relying on client to poll balance later
        // But for reliable rewards, we should confirm. Let's start the confirm but return early? 
        // No, better to wait a bit or let frontend handle "Pending". 
        // For this prototype, we'll wait for confirmation to ensure user sees the balance update.
        await connection.confirmTransaction(signature, "confirmed");

        return NextResponse.json({
            success: true,
            simulated: false,
            message: "Reward Sent!",
            amount: REWARD_AMOUNT,
            tx: signature
        });

    } catch (error: any) {
        console.error("Reward Error:", error);
        return NextResponse.json({ error: error.message || "Reward failed" }, { status: 500 });
    }
}


export const runtime = 'edge';