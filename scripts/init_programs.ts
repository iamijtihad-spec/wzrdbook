import * as anchor from "@coral-xyz/anchor";
import { Program } from "@coral-xyz/anchor";
import { Connection, Keypair, PublicKey, clusterApiUrl } from "@solana/web3.js";
import fs from "fs";
import os from "os";
import path from "path";

// Load IDLs
import gritBondingIdl from "../lib/idl/grit_bonding.json" with { type: "json" };

const BONDING_PROGRAM_ID = new PublicKey("8N8qeFRcxnwJKn2mWvhMahP2S3ChfPwynRtVKAvPepY1");

async function main() {
    process.env.ANCHOR_WALLET = path.join(os.homedir(), ".config/solana/id.json");
    process.env.ANCHOR_PROVIDER_URL = "http://localhost:8899";

    const provider = anchor.AnchorProvider.env();
    anchor.setProvider(provider);

    const program = new Program(gritBondingIdl as anchor.Idl, BONDING_PROGRAM_ID, provider);

    console.log("Initializing Bonding Curve...");

    // Generate a new keypair for the CurveConfig account
    // In a real app, this might be a PDA, but the contract uses a Keypair account for init.
    const curveConfig = Keypair.generate();

    try {
        const tx = await program.methods.initialize(
            new anchor.BN(1000), // Slope (1000 lamports per token?)
            new anchor.BN(100000) // Base Price (0.0001 SOL)
        )
            .accounts({
                curveConfig: curveConfig.publicKey,
                authority: provider.wallet.publicKey,
                systemProgram: anchor.web3.SystemProgram.programId,
            })
            .signers([curveConfig])
            .rpc();

        console.log("Bonding Curve Initialized!");
        console.log("Tx Signature:", tx);
        console.log("Curve Config Public Key:", curveConfig.publicKey.toBase58());

        // Save this key to a file so frontend can use it
        const configPath = path.join(process.cwd(), "lib/bonding-config.json");
        fs.writeFileSync(configPath, JSON.stringify({
            curveConfig: curveConfig.publicKey.toBase58()
        }, null, 2));
        console.log("Saved config to lib/bonding-config.json");

    } catch (err) {
        console.error("Initialization failed:", err);
    }
}

main();
