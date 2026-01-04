
import { Connection, PublicKey, Keypair } from "@solana/web3.js";
import { getAccount, TOKEN_PROGRAM_ID } from "@solana/spl-token";
import * as dotenv from "dotenv";
import * as fs from "fs";
import * as path from "path";

// Load Env
const envPath = path.resolve(__dirname, "../.env.local");
dotenv.config({ path: envPath });

const RPC_URL = process.env.SOLANA_RPC_URL || "https://api.devnet.solana.com";
const connection = new Connection(RPC_URL, "confirmed");

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

    // 2. Fallback to File
    if (!treasuryPubkey) {
        const devWalletPath = path.resolve(__dirname, "dev-wallet.json");
        if (fs.existsSync(devWalletPath)) {
            const secret = JSON.parse(fs.readFileSync(devWalletPath, "utf-8"));
            treasuryPubkey = Keypair.fromSecretKey(Uint8Array.from(secret)).publicKey;
        }
    }

    if (!treasuryPubkey) {
        console.error("❌ Treasury not found!");
        return;
    }

    console.log(`\n🔍 SCANNING TREASURY: ${treasuryPubkey.toBase58()}\n` + "=".repeat(60));

    // Fetch all token accounts
    const accounts = await connection.getParsedTokenAccountsByOwner(treasuryPubkey, {
        programId: TOKEN_PROGRAM_ID
    });

    console.log(`Found ${accounts.value.length} Token Accounts:\n`);
    console.log(`| ${"Mint Address".padEnd(44)} | ${"Balance".padEnd(10)} | ${"Decimals".padEnd(8)} |`);
    console.log(`|${"-".repeat(46)}|${"-".repeat(12)}|${"-".repeat(10)}|`);

    for (const { account } of accounts.value) {
        const info = account.data.parsed.info;
        const mint = info.mint;
        const amount = info.tokenAmount.uiAmount || 0;
        const decimals = info.tokenAmount.decimals;

        // Highlight likely candidates for Tour Ticket (Supply ~500)
        let note = "";
        if (amount === 500) note = " 🎟️  <-- PURPLE TICKET?";
        if (amount === 1000) note = " 📀  <-- COMMON?";
        if (amount === 5) note = " 🏆  <-- LEGENDARY?";
        if (amount === 50) note = " 💎  <-- RARE?";
        if (amount > 10000) note = " 💰  <-- TOKEN?";

        console.log(`| ${mint.padEnd(44)} | ${amount.toString().padEnd(10)} | ${decimals.toString().padEnd(8)} |${note}`);
    }
    console.log("\n" + "=".repeat(60) + "\n");
}

main();
