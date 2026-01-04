import { NextRequest, NextResponse } from "next/server";
import { Connection, Keypair, PublicKey, Transaction, clusterApiUrl } from "@solana/web3.js";
import { getAssociatedTokenAddress, createAssociatedTokenAccountInstruction, createTransferInstruction, getMint } from "@solana/spl-token";
import fs from "fs";
import path from "path";

// Configuration
const MINTS = {
    "GRIT": process.env.GRIT_MINT || "CS8ZQMdJ5t5hNuM51LXJBU4zBysZWAkFj9oJ6MwtnHsS",
    "MOXY": process.env.MOXY_MINT || "2FFhBNoCqsgXejrqQXk3gJXWyG9nuiE7qj4Sv2wrcnwq",
    "CHI": process.env.CHI_MINT || "5Z5YkiXqBQyVaz8dhrM2DCDynnmNkaFa7AZDoHchQtEj" // Updated
};

export async function POST(request: NextRequest) {
    try {
        const { recipient, amount, token = "CHI" } = await request.json();

        if (!recipient || !amount) {
            return NextResponse.json({ success: false, error: "Missing recipient or amount" }, { status: 400 });
        }

        const connection = new Connection(clusterApiUrl("devnet"), "confirmed");

        // LOAD TREASURY (Priority: Env -> File)
        let treasury: Keypair;
        const treasuryPath = path.join(process.cwd(), "scripts/dev-wallet.json");

        if (process.env.TREASURY_SECRET) {
            const secret = process.env.TREASURY_SECRET;
            if (secret.startsWith('[')) {
                treasury = Keypair.fromSecretKey(Uint8Array.from(JSON.parse(secret)));
            } else {
                return NextResponse.json({ success: false, error: "Invalid TREASURY_SECRET format" }, { status: 500 });
            }
        } else if (fs.existsSync(treasuryPath)) {
            const secretKey = JSON.parse(fs.readFileSync(treasuryPath, "utf-8"));
            treasury = Keypair.fromSecretKey(new Uint8Array(secretKey));
        } else {
            return NextResponse.json({ success: false, error: "Treasury not configured (File or Env missing)" }, { status: 500 });
        }

        // RESOLVE MINT
        const mintKey = MINTS[token as keyof typeof MINTS];
        if (!mintKey) {
            return NextResponse.json({ success: false, error: `Invalid Token Symbol: ${token}` }, { status: 400 });
        }
        const mintPubkey = new PublicKey(mintKey);

        let recipientPubkey;
        try {
            recipientPubkey = new PublicKey(recipient);
        } catch (e) {
            return NextResponse.json({ success: false, error: "Invalid recipient address" }, { status: 400 });
        }

        // Fetch decimals
        const mintInfo = await getMint(connection, mintPubkey);
        const amountBigInt = BigInt(Math.floor(parseFloat(amount) * Math.pow(10, mintInfo.decimals)));

        const treasuryATA = await getAssociatedTokenAddress(mintPubkey, treasury.publicKey);
        const recipientATA = await getAssociatedTokenAddress(mintPubkey, recipientPubkey);

        const debugLog = `
TIMESTAMP: ${new Date().toISOString()}
Treasury: ${treasury.publicKey.toBase58()}
Mint: ${mintPubkey.toBase58()}
Treasury ATA: ${treasuryATA.toBase58()}
Recipient ATA: ${recipientATA.toBase58()}
----------------------------------------
`;
        fs.appendFileSync(path.join(process.cwd(), "airdrop_debug.log"), debugLog);

        const transferTx = new Transaction();

        // Check if recipient needs ATA
        const accountInfo = await connection.getAccountInfo(recipientATA);
        if (!accountInfo) {
            transferTx.add(
                createAssociatedTokenAccountInstruction(
                    treasury.publicKey,
                    recipientATA,
                    recipientPubkey,
                    mintPubkey
                )
            );
        }

        transferTx.add(
            createTransferInstruction(
                treasuryATA,
                recipientATA,
                treasury.publicKey,
                amountBigInt
            )
        );

        const signature = await connection.sendTransaction(transferTx, [treasury]);
        await connection.confirmTransaction(signature);

        // --- DISCORD NOTIFICATION ---
        try {
            const shortAddr = recipient.slice(0, 4) + '...' + recipient.slice(-4);
            const embed = {
                title: "💰 BOUNTY CLAIMED",
                description: `**${shortAddr}** has been rewarded **${amount} ${token}**.`,
                color: 16766720, // Gold
                fields: [
                    { name: "Recipient", value: `\`${shortAddr}\``, inline: true },
                    { name: "Amount", value: `**${amount}** ${token}`, inline: true },
                    { name: "Signature", value: `[View on Solscan](https://solscan.io/tx/${signature}?cluster=devnet)`, inline: false }
                ],
                footer: { text: "Saturn Protocol Treasury" },
                timestamp: new Date().toISOString()
            };

            const botUrl = process.env.NEXT_PUBLIC_BOT_URL || "http://localhost:3001";
            await fetch(`${botUrl}/api/notify`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    channelIdx: 'BOUNTIES',
                    embed: embed
                })
            });
        } catch (e) {
            console.error("Failed to push to Discord:", e);
            // Non-blocking
        }

        try {
            const { ServerLedger } = await import("@/lib/server-ledger");
            await ServerLedger.log({
                type: "transfer", // "bounty" if we had a specific flag
                description: `Airdropped ${amount} ${token}`,
                actor: "ADMIN",
                target: recipient,
                amount: parseFloat(amount),
                signature: signature,
                meta: { token }
            }, (process as any).env);
        } catch (e) { console.error("Ledger Log Failed", e); }

        return NextResponse.json({ success: true, signature });

    } catch (error: any) {
        console.error("Airdrop API Error:", JSON.stringify(error, Object.getOwnPropertyNames(error)));
        return NextResponse.json({
            success: false,
            error: error.message || JSON.stringify(error, Object.getOwnPropertyNames(error))
        }, { status: 500 });
    }
}
