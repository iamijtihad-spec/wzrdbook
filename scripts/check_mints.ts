
import { Connection, PublicKey } from "@solana/web3.js";
import { getMint } from "@solana/spl-token";
import * as dotenv from "dotenv";
import * as path from "path";

// Load Env
const envPath = path.resolve(__dirname, "../.env.local");
dotenv.config({ path: envPath });

const RPC_URL = process.env.SOLANA_RPC_URL || "https://api.devnet.solana.com";
const connection = new Connection(RPC_URL, "confirmed");

const MINTS = {
    GRIT: process.env.GRIT_MINT || "CS8ZQMdJ5t5hNuM51LXJBU4zBysZWAkFj9oJ6MwtnHsS",
    MOXY: process.env.MOXY_MINT || "2FFhBNoCqsgXejrqQXk3gJXWyG9nuiE7qj4Sv2wrcnwq",
    CHI: process.env.CHI_MINT || "5Z5YkiXqBQyVaz8dhrM2DCDynnmNkaFa7AZDoHchQtEj"
};

async function checkMint(symbol: string, address: string) {
    try {
        console.log(`Checking ${symbol}: ${address}...`);
        const pubkey = new PublicKey(address);
        const mintInfo = await getMint(connection, pubkey);
        console.log(`✅ ${symbol} Valid. Supply: ${mintInfo.supply}, Decimals: ${mintInfo.decimals}`);
    } catch (e: any) {
        console.error(`❌ ${symbol} INVALID: ${e.message}`);
    }
}

async function main() {
    console.log("--- MINT VALIDATION ---");
    await checkMint("GRIT", MINTS.GRIT);
    await checkMint("MOXY", MINTS.MOXY);
    await checkMint("CHI", MINTS.CHI);
    console.log("-----------------------");
}

main();
