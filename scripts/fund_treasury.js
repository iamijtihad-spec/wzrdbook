const { Connection, Keypair, LAMPORTS_PER_SOL } = require("@solana/web3.js");
const fs = require("fs");
const path = require("path");

const WALLET_PATH = path.join(__dirname, "dev-wallet.json");
const wallet = JSON.parse(fs.readFileSync(WALLET_PATH, "utf-8"));
const keypair = Keypair.fromSecretKey(new Uint8Array(wallet));

const connection = new Connection("https://api.devnet.solana.com", "confirmed");

async function fund() {
    console.log(`Funding Treasury: ${keypair.publicKey.toBase58()}`);
    const balanceBefore = await connection.getBalance(keypair.publicKey);
    console.log(`Balance: ${balanceBefore / LAMPORTS_PER_SOL} SOL`);

    console.log("Requesting Airdrop (1 SOL)...");
    const sig = await connection.requestAirdrop(keypair.publicKey, 1 * LAMPORTS_PER_SOL);

    // Confirm
    const latestBlockHash = await connection.getLatestBlockhash();
    await connection.confirmTransaction({
        blockhash: latestBlockHash.blockhash,
        lastValidBlockHeight: latestBlockHash.lastValidBlockHeight,
        signature: sig
    });

    const balanceAfter = await connection.getBalance(keypair.publicKey);
    console.log(`New Balance: ${balanceAfter / LAMPORTS_PER_SOL} SOL`);
}

fund().catch(console.error);
