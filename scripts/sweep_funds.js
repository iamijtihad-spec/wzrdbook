const { Connection, Keypair, PublicKey, Transaction, SystemProgram, LAMPORTS_PER_SOL, sendAndConfirmTransaction } = require("@solana/web3.js");
const bs58 = require("bs58");
const fs = require("fs");
const path = require("path");

const connection = new Connection("https://api.devnet.solana.com", "confirmed");
const TREASURY_PUBKEY = new PublicKey("7tPex3v45MN42hD6m9vHgSKvkEqtE2XpmigLWLMctST7");

// User provided Base58 Private Key
const USER_KEY_STRING = "2Tcm6dHRJzGKcbdz2p7SDzkxxcXwJaL4rXmSehik8onPtACXroDGU4GH1EvYTcQopHB6dERRCnU944oFxwyLStsN";

async function sweep() {
    console.log("🧹 Initializing Sweep...");

    let userKeypair;
    try {
        // Handle bs58 import variations
        const decode = bs58.decode || bs58.default?.decode || bs58;
        if (typeof decode !== 'function') throw new Error("Could not find bs58.decode function");

        const decoded = decode(USER_KEY_STRING);
        userKeypair = Keypair.fromSecretKey(decoded);
        console.log(`✅ Recovered User Wallet: ${userKeypair.publicKey.toBase58()}`);
    } catch (e) {
        console.error("❌ Invalid Private Key format.", e);
        return;
    }

    const balance = await connection.getBalance(userKeypair.publicKey);
    console.log(`💰 Balance: ${balance / LAMPORTS_PER_SOL} SOL`);

    if (balance <= 5000) {
        console.error("❌ Insufficient funds to sweep (need > 0.000005 SOL for fees).");
        return;
    }

    // Reserve 0.00001 SOL for fees/rent to be safe, sweep rest
    const amountToSend = balance - 5000; // Leave 5000 lamports dust
    console.log(`💸 Sweeping ${(amountToSend / LAMPORTS_PER_SOL).toFixed(6)} SOL to Treasury...`);

    const transaction = new Transaction().add(
        SystemProgram.transfer({
            fromPubkey: userKeypair.publicKey,
            toPubkey: TREASURY_PUBKEY,
            lamports: amountToSend,
        })
    );

    try {
        const signature = await sendAndConfirmTransaction(connection, transaction, [userKeypair]);
        console.log(`✅ Sweep Complete! Signature: ${signature}`);

        const newTreasuryBal = await connection.getBalance(TREASURY_PUBKEY);
        console.log(`🏦 New Treasury Balance: ${newTreasuryBal / LAMPORTS_PER_SOL} SOL`);

    } catch (e) {
        console.error("❌ Transfer Failed:", e.message);
    }
}

sweep().catch(console.error);
