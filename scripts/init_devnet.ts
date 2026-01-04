
import * as anchor from "@coral-xyz/anchor";
import { Program, Wallet } from "@coral-xyz/anchor";
import { Connection, Keypair, PublicKey, SystemProgram, Transaction } from "@solana/web3.js";
import { getAssociatedTokenAddress, createAssociatedTokenAccountInstruction } from "@solana/spl-token";
import fs from "fs";
import path from "path";

// 1. Config List
// These must match deployed IDs
const BONDING_ID = new PublicKey("8N8qeFRcxnwJKn2mWvhMahP2S3ChfPwynRtVKAvPepY1");
const STAKING_ID = new PublicKey("G9Xq99jdwuvQD1nGGhW1C3TYuc6iRz78faoscQqmX2D7");

// The Mint used in the App
const GRIT_MINT = new PublicKey("CS8ZQMdJ5t5hNuM51LXJBU4zBysZWAkFj9oJ6MwtnHsS");

// Load IDLs (assuming they are in target/idl or we use the ones from import)
// We will use raw JSON import for simplicity in this script context
const bondingIdl = JSON.parse(fs.readFileSync(path.resolve(__dirname, "../grit-programs/target/idl/grit_bonding.json"), "utf8"));
const stakingIdl = JSON.parse(fs.readFileSync(path.resolve(__dirname, "../grit-programs/target/idl/grit_staking.json"), "utf8"));

const CONFIG_PATH = path.resolve(__dirname, "../lib/bonding-config.json");

async function main() {
    // Setup Provider
    const connection = new Connection("https://api.devnet.solana.com", "confirmed");

    // Load Wallet from default location
    const walletPath = "/Users/wzrdbook/.config/solana/id.json";
    const secretKey = Uint8Array.from(JSON.parse(fs.readFileSync(walletPath, "utf8")));
    const keypair = Keypair.fromSecretKey(secretKey);
    const wallet = new Wallet(keypair);

    const provider = new anchor.AnchorProvider(connection, wallet, {});
    anchor.setProvider(provider);

    console.log("🚀 Initializing on Devnet...");
    console.log("Wallet:", wallet.publicKey.toBase58());

    // --- 1. Bonding Initialization ---
    const bondingProgram = new Program(bondingIdl, BONDING_ID, provider);

    // Generate new Curve Config Account
    const curveConfig = Keypair.generate();
    console.log("Creating new Curve Config:", curveConfig.publicKey.toBase58());

    const slope = new anchor.BN(100000); // Example slope
    const basePrice = new anchor.BN(10000000); // 0.01 SOL base

    try {
        await bondingProgram.methods.initialize(slope, basePrice)
            .accounts({
                curveConfig: curveConfig.publicKey,
                authority: wallet.publicKey,
                systemProgram: SystemProgram.programId,
            })
            .signers([curveConfig])
            .rpc();

        console.log("✅ Bonding Initialized!");

        // Update Config File
        const config = { curveConfig: curveConfig.publicKey.toBase58() };
        fs.writeFileSync(CONFIG_PATH, JSON.stringify(config, null, 2));
        console.log("💾 Saved to bonding-config.json");

    } catch (e) {
        console.error("❌ Bonding Init Failed:", e);
    }

    // --- 2. Staking Initialization ---
    // Goal: Create ATA for the Staking Program (The Vault)
    console.log("Initializing Staking Vault...");

    try {
        const vault = await getAssociatedTokenAddress(GRIT_MINT, STAKING_ID, true);
        console.log("Vault Address:", vault.toBase58());

        const info = await connection.getAccountInfo(vault);
        if (info) {
            console.log("✅ Vault already exists.");
        } else {
            console.log("Creating Vault ATA...");
            const tx = new Transaction().add(
                createAssociatedTokenAccountInstruction(
                    wallet.publicKey, // payer
                    vault, // ata
                    STAKING_ID, // owner
                    GRIT_MINT // mint
                )
            );
            await provider.sendAndConfirm(tx);
            console.log("✅ Vault Created!");
        }

    } catch (e) {
        console.error("❌ Staking Vault Init Failed:", e);
        console.log("⚠️ Note: If GRIT_MINT does not exist on Devnet, this will fail. Ensure mint CS8ZQ... exists.");
    }
}

main().then(() => console.log("Done."));
