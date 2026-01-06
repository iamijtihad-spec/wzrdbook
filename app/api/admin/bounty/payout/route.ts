
import { NextRequest, NextResponse } from "next/server";
import { Connection, PublicKey, Transaction, clusterApiUrl, Keypair } from "@solana/web3.js";
import { getAssociatedTokenAddress, createAssociatedTokenAccountInstruction, createTransferInstruction, getAccount } from "@solana/spl-token";
import fs from "fs";
import path from "path";
import { ServerLedger } from "@/lib/server-ledger";

export async function POST(request: NextRequest) {
    try {
        const body = await request.json();
        const { recipient, nftMint } = body;

        if (!recipient || !nftMint) {
            return NextResponse.json({ error: "Missing recipient or nftMint" }, { status: 400 });
        }

        // --- AUTH CHECK (TODO: Implement real auth) ---
        // For now, we assume this is called by Admin Dashboard or Discord Bot (internal)

        const connection = new Connection(process.env.SOLANA_RPC_URL || clusterApiUrl("devnet"), "confirmed");
        const recipientPubkey = new PublicKey(recipient);
        const mintPubkey = new PublicKey(nftMint);

        // --- LOAD TREASURY ---
        let treasury: Keypair;
        const treasuryPath = path.join(process.cwd(), "scripts/dev-wallet.json");
        if (process.env.TREASURY_SECRET) {
            treasury = Keypair.fromSecretKey(Uint8Array.from(JSON.parse(process.env.TREASURY_SECRET)));
        } else if (fs.existsSync(treasuryPath)) {
            const secret = JSON.parse(fs.readFileSync(treasuryPath, "utf-8"));
            treasury = Keypair.fromSecretKey(new Uint8Array(secret));
        } else {
            return NextResponse.json({ error: "Treasury configuration missing" }, { status: 500 });
        }

        // --- CHECK SUPPLY ---
        const treasuryATA = await getAssociatedTokenAddress(mintPubkey, treasury.publicKey);
        try {
            const treasuryAccount = await getAccount(connection, treasuryATA);
            if (Number(treasuryAccount.amount) === 0) {
                return NextResponse.json({ error: "Bounty item out of stock in Treasury." }, { status: 400 });
            }
        } catch (e) {
            return NextResponse.json({ error: "Treasury does not hold this item." }, { status: 404 });
        }

        // --- PREPARE TRANSFER ---
        const transaction = new Transaction();
        const recipientATA = await getAssociatedTokenAddress(mintPubkey, recipientPubkey);

        const accountInfo = await connection.getAccountInfo(recipientATA);
        if (!accountInfo) {
            transaction.add(
                createAssociatedTokenAccountInstruction(
                    treasury.publicKey, // Payer
                    recipientATA,
                    recipientPubkey,
                    mintPubkey
                )
            );
        }

        transaction.add(
            createTransferInstruction(
                treasuryATA,
                recipientATA,
                treasury.publicKey,
                1 // Amount 1 for NFT
            )
        );

        // --- SEND ---
        const signature = await connection.sendTransaction(transaction, [treasury], { skipPreflight: false });

        // --- LOG ---
        ServerLedger.log({
            type: "bounty",
            description: `Bounty Payout: ${nftMint.slice(0, 8)}...`,
            actor: "ADMIN",
            target: recipient,
            signature: signature,
            amount: 1
        });

        return NextResponse.json({
            success: true,
            signature,
            message: "Bounty Payout Sent!"
        });

    } catch (e: any) {
        console.error("Bounty Payout Error:", e);
        return NextResponse.json({ error: e.message }, { status: 500 });
    }
}


export const runtime = 'edge';