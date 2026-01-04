const { Connection, Keypair, PublicKey, SystemProgram, LAMPORTS_PER_SOL } = require("@solana/web3.js");
const { Program, AnchorProvider, Wallet, BN } = require("@coral-xyz/anchor");
const fs = require("fs");
const path = require("path");
const gritBondingIdl = require("../lib/idl/grit_bonding.json");

async function main() {
    console.log("Resetting Bonding Curve...");

    // 1. Connection
    const connection = new Connection("http://127.0.0.1:8899", "confirmed");

    // 2. Setup Payer (Ephemeral)
    const payer = Keypair.generate();
    console.log("Payer:", payer.publicKey.toBase58());

    console.log("Requesting Airdrop...");
    const sig = await connection.requestAirdrop(payer.publicKey, 2 * LAMPORTS_PER_SOL);
    const latest = await connection.getLatestBlockhash();
    await connection.confirmTransaction({
        signature: sig,
        blockhash: latest.blockhash,
        lastValidBlockHeight: latest.lastValidBlockHeight
    });
    console.log("Airdrop confirmed.");

    // 3. Setup Anchor Provider
    const wallet = new Wallet(payer);
    const provider = new AnchorProvider(connection, wallet, { commitment: "confirmed" });
    const programId = new PublicKey("8N8qeFRcxnwJKn2mWvhMahP2S3ChfPwynRtVKAvPepY1");
    const program = new Program(gritBondingIdl, programId, provider);

    // 4. Generate New Curve Config
    const curveConfig = Keypair.generate();
    console.log("New Curve Config:", curveConfig.publicKey.toBase58());

    // 5. Initialize
    // Slope = 0 (To prevent overflow on Raw Supply). 
    // BasePrice = 100,000 lamports (0.0001 SOL).
    // Price = 0.0001 SOL fixed.
    const slope = new BN(0);
    const basePrice = new BN(100_000);

    await program.methods.initialize(slope, basePrice)
        .accounts({
            curveConfig: curveConfig.publicKey,
            authority: payer.publicKey,
            systemProgram: SystemProgram.programId,
        })
        .signers([curveConfig])
        .rpc();

    console.log("Initialized successfully!");

    // 6. Update Config File
    const configPath = path.join(__dirname, "../lib/bonding-config.json");
    const config = { "curveConfig": curveConfig.publicKey.toBase58() };
    fs.writeFileSync(configPath, JSON.stringify(config, null, 2));

    console.log("Updated lib/bonding-config.json");
}

main().catch(console.error);
