
import { Connection, Keypair, PublicKey, LAMPORTS_PER_SOL } from "@solana/web3.js";
import { getAssociatedTokenAddress, getAccount } from "@solana/spl-token";
import fs from "fs";
import path from "path";
import dotenv from "dotenv";

dotenv.config({ path: ".env.local" });

const RPC_URL = process.env.NEXT_PUBLIC_SOLANA_RPC_URL || "https://api.devnet.solana.com";
const GRIT_MINT = new PublicKey(process.env.GRIT_MINT || "CS8ZQMdJ5t5hNuM51LXJBU4zBysZWAkFj9oJ6MwtnHsS");

async function checkTreasury() {
    const connection = new Connection(RPC_URL, "confirmed");
    const walletPath = path.join(process.cwd(), "scripts/dev-wallet.json");

    if (!fs.existsSync(walletPath)) {
        console.error("❌ No wallet found at scripts/dev-wallet.json");
        return;
    }

    const secretKey = JSON.parse(fs.readFileSync(walletPath, "utf-8"));
    const keypair = Keypair.fromSecretKey(new Uint8Array(secretKey));
    const address = keypair.publicKey.toBase58();

    console.log("\n🏦 --- TREASURY STATUS ---");
    console.log(`Address: ${address}`);

    // Check SOL
    const solBalance = await connection.getBalance(keypair.publicKey);
    console.log(`SOL:     ${(solBalance / LAMPORTS_PER_SOL).toFixed(4)} SOL`);

    // Check GRIT
    try {
        const ata = await getAssociatedTokenAddress(GRIT_MINT, keypair.publicKey);
        const tokenAccount = await getAccount(connection, ata);
        const amount = Number(tokenAccount.amount) / 1_000_000_000; // Assuming 9 decimals
        console.log(`GRIT:    ${amount.toLocaleString()} GRIT`);
    } catch (e) {
        console.log(`GRIT:    0 (No Account Found)`);
    }

    console.log("\n💧 --- HYDRATION INSTRUCTIONS ---");
    console.log(`1. Send SOL (Devnet) to: ${address}`);
    console.log(`   (Use 'solana airdrop 2 ${address}' or a faucet)`);
    console.log(`2. Send GRIT tokens to: ${address}`);
    console.log(`-------------------------------\n`);
}

checkTreasury();
