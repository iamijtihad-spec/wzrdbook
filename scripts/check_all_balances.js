const { Connection, PublicKey, LAMPORTS_PER_SOL } = require("@solana/web3.js");
const fs = require("fs");
const path = require("path");

const connection = new Connection("https://api.devnet.solana.com", "confirmed");

const CURRENT_TREASURY_PUBKEY = "7tPex3v45MN42hD6m9vHgSKvkEqtE2XpmigLWLMctST7";
const USER_PROVIDED_KEY = "FycgQBYygUY6ZDk3QHPQi9t468VTfTDXTNRRpYkTj3Tr";

async function checkBalances() {
    console.log("🔍 Checking Balances...");

    // Check Current Treasury
    try {
        const balTreasury = await connection.getBalance(new PublicKey(CURRENT_TREASURY_PUBKEY));
        console.log(`Current Treasury (${CURRENT_TREASURY_PUBKEY}): ${balTreasury / LAMPORTS_PER_SOL} SOL`);
    } catch (e) { console.error("Error checking Treasury:", e.message); }

    // Check User Provided Key
    try {
        const balUser = await connection.getBalance(new PublicKey(USER_PROVIDED_KEY));
        console.log(`User Provided Key (${USER_PROVIDED_KEY}): ${balUser / LAMPORTS_PER_SOL} SOL`);
    } catch (e) {
        console.error("Error checking User Key:", e.message);
        console.log("Note: The provided string might not be a valid Public Key.");
    }
}

checkBalances();
