
import { Connection, Keypair, PublicKey } from "@solana/web3.js";
import { createMint, getOrCreateAssociatedTokenAccount, mintTo } from "@solana/spl-token";
import * as dotenv from "dotenv";
import * as fs from "fs";
import * as path from "path";

// Load Env
const envPath = path.resolve(__dirname, "../.env.local");
dotenv.config({ path: envPath });

const RPC_URL = process.env.SOLANA_RPC_URL || "https://api.devnet.solana.com";
const connection = new Connection(RPC_URL, "confirmed");

async function main() {
    // 1. Load Treasury (Payer & Authority & Destination)
    let treasury: Keypair;
    if (process.env.TREASURY_SECRET) {
        treasury = Keypair.fromSecretKey(Uint8Array.from(JSON.parse(process.env.TREASURY_SECRET)));
    } else {
        const treasuryPath = path.join(process.cwd(), "scripts/dev-wallet.json");
        const secret = JSON.parse(fs.readFileSync(treasuryPath, "utf-8"));
        treasury = Keypair.fromSecretKey(new Uint8Array(secret));
    }

    console.log(`\n🎫 MINTING TOUR TICKET 2025`);
    console.log(`   Authority: ${treasury.publicKey.toBase58()}`);

    try {
        // 2. Create Mint
        // Decimals: 0 (NFT style) or 9? 
        // Config says supply 500. Usually "Items" like tickets might be 0 decimals if they are non-divisible unique tokens, 
        // but often printed as "fungible" with 0 decimals for tickets.
        // Let's go with 0 decimals for a "Ticket".
        const decimals = 0;

        const mint = await createMint(
            connection,
            treasury,           // Payer
            treasury.publicKey, // Mint Authority
            treasury.publicKey, // Freeze Authority
            decimals            // Decimals
        );

        console.log(`   ✅ Mint Created: ${mint.toBase58()}`);

        // 3. Get Treasury Token Account
        const treasuryATA = await getOrCreateAssociatedTokenAccount(
            connection,
            treasury,
            mint,
            treasury.publicKey
        );

        // 4. Mint 500 Tokens
        const supply = 500;
        await mintTo(
            connection,
            treasury,
            mint,
            treasuryATA.address,
            treasury,
            supply // Amount (with 0 decimals, 500 = 500 units)
        );

        console.log(`   ✅ Minted ${supply} Tickets to Treasury`);
        console.log(`   ----------------------------------------`);
        console.log(`   NEW MINT ADDRESS: ${mint.toBase58()}`);
        console.log(`   ----------------------------------------\n`);

    } catch (e: any) {
        console.error("❌ Minting Failed:", e.message);
    }
}

main();
