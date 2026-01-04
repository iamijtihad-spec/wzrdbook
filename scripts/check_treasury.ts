
import { Connection, PublicKey, Keypair, LAMPORTS_PER_SOL } from "@solana/web3.js";
import { getAssociatedTokenAddress, getAccount } from "@solana/spl-token";
import * as dotenv from "dotenv";
import * as fs from "fs";
import * as path from "path";

// Load Env
const envPath = path.resolve(__dirname, "../.env.local");
dotenv.config({ path: envPath });

const RPC_URL = process.env.SOLANA_RPC_URL || "https://api.devnet.solana.com";
const connection = new Connection(RPC_URL, "confirmed");

// Mints
const MINTS = {
    GRIT: new PublicKey(process.env.GRIT_MINT || "CS8ZQMdJ5t5hNuM51LXJBU4zBysZWAkFj9oJ6MwtnHsS"),
    MOXY: new PublicKey(process.env.MOXY_MINT || "2FFhBNoCqsgXejrqQXk3gJXWyG9nuiE7qj4Sv2wrcnwq"),
    CHI: new PublicKey(process.env.CHI_MINT || "5Z5YkiXqBQyVaz8dhrM2DCDynnmNkaFa7AZDoHchQtEj")
};
console.log("--- MINT CONFIG ---");
console.log("GRIT:", MINTS.GRIT.toBase58());
console.log("MOXY:", MINTS.MOXY.toBase58());
console.log("CHI: ", MINTS.CHI.toBase58());
console.log("-------------------");

async function main() {
    let treasuryPubkey: PublicKey | null = null;

    // 1. Try Loading from Secret
    if (process.env.TREASURY_SECRET) {
        try {
            const secret = JSON.parse(process.env.TREASURY_SECRET);
            const keypair = Keypair.fromSecretKey(Uint8Array.from(secret));
            treasuryPubkey = keypair.publicKey;
        } catch (e) {
            console.error("Failed to parse TREASURY_SECRET");
        }
    }

    // 2. Fallback to hardcoded public key if secret fails (or just to be safe)
    if (!treasuryPubkey) {
        // Fallback to the known public key if available, otherwise generated one is useless for reading balance
        // We will assume the secret works or the user provided the pubkey previously
        // Check if dev-wallet.json exists
        const devWalletPath = path.resolve(__dirname, "dev-wallet.json");
        if (fs.existsSync(devWalletPath)) {
            const secret = JSON.parse(fs.readFileSync(devWalletPath, "utf-8"));
            treasuryPubkey = Keypair.fromSecretKey(Uint8Array.from(secret)).publicKey;
        }
    }

    if (!treasuryPubkey) {
        // Last resort: The one provided in conversation
        treasuryPubkey = new PublicKey("2AXpsEQSAdqc45kSrcad7dEfPzAXb7uHz8gbp7BJRjCi");
    }

    console.log(`\n🏦 TREASURY AUDIT: ${treasuryPubkey.toBase58()}\n` + "=".repeat(50));

    // SOL Balance
    const solBalance = await connection.getBalance(treasuryPubkey);
    console.log(`\nSOL:  ${(solBalance / LAMPORTS_PER_SOL).toFixed(4)} SOL`);

    // SPL Tokens
    for (const [name, mint] of Object.entries(MINTS)) {
        try {
            const ata = await getAssociatedTokenAddress(mint, treasuryPubkey);
            const account = await getAccount(connection, ata);
            const amount = Number(account.amount); // Careful with large numbers, but good for display
            // We assume 9 decimals for now, ideally fetch mint info
            // Standardizing display
            // Let's format nicely if we know decimals (9 usually)
            // Or better, use getTokenAccountBalance for formatted

            const bal = await connection.getTokenAccountBalance(ata);
            console.log(`${name}: ${bal.value.uiAmountString}`);
        } catch (e: any) {
            if (e.message.includes("could not find account")) {
                console.log(`${name}: 0 (No Account)`);
            } else {
                console.log(`${name}: Error (${e.message})`);
            }
        }
    }
    console.log("\n" + "=".repeat(50) + "\n");
}

main();
