
import { Connection, PublicKey, Keypair, LAMPORTS_PER_SOL } from '@solana/web3.js';
import { getOrCreateAssociatedTokenAccount, transfer } from '@solana/spl-token';
import dotenv from 'dotenv';
import path from 'path';

// Load env from root
dotenv.config({ path: path.join(__dirname, '../../.env.local') });

// Configuration
const CONFIG = {
    MAINNET_RPC: process.env.NEXT_PUBLIC_SOLANA_RPC_URL || "https://api.mainnet-beta.solana.com",
    DEVNET_RPC: process.env.DEVNET_RPC_URL || "https://api.devnet.solana.com",
    TREASURY_PUBKEY: new PublicKey(process.env.NEXT_PUBLIC_TREASURY_PUBKEY || "FycgQBYygUY6ZDk3QHPQi9t468VTfTDXTNRRpYkTj3Tr"),
    // In production, these should be securely managed secrets
    GOD_WALLET: process.env.DEVNET_GOD_KEY ? Keypair.fromSecretKey(Uint8Array.from(JSON.parse(process.env.DEVNET_GOD_KEY))) : Keypair.generate(),
    GRIT_MINT: new PublicKey("CS8ZQMdJ5t5hNuM51LXJBU4zBysZWAkFj9oJ6MwtnHsS"), // Default GRIT
    EXCHANGE_RATE: 100000 // 100k GRIT per 1 SOL
};

async function main() {
    console.log("🕯️ Oracle is awake. Connecting to flows...");
    console.log(`   Watching Treasury: ${CONFIG.TREASURY_PUBKEY.toBase58()}`);

    const mainnetConn = new Connection(CONFIG.MAINNET_RPC, 'confirmed');
    const devnetConn = new Connection(CONFIG.DEVNET_RPC, 'confirmed');

    // WARNING: In this demo environment, we might not have a real GOD_WALLET key. 
    // We'll log the intention if we can't sign.
    const canSign = !!process.env.DEVNET_GOD_KEY;

    mainnetConn.onLogs(CONFIG.TREASURY_PUBKEY, async (logs, ctx) => {
        if (logs.err) return;

        try {
            const signature = logs.signature;
            console.log(`🔎 Detected Activity: ${signature}`);

            // Fetch full transaction
            const tx = await mainnetConn.getTransaction(signature, {
                commitment: 'confirmed',
                maxSupportedTransactionVersion: 0
            });

            if (!tx) return;

            // Analyze Balance Changes for Treasury
            const accountKeys = tx.transaction.message.staticAccountKeys; // or getAccountKeys() if available in version
            const treasuryIndex = accountKeys.findIndex(k => k.equals(CONFIG.TREASURY_PUBKEY));

            if (treasuryIndex === -1) return;

            const preBal = tx.meta?.preBalances[treasuryIndex] || 0;
            const postBal = tx.meta?.postBalances[treasuryIndex] || 0;
            const deltaLamports = postBal - preBal;

            if (deltaLamports > 0) {
                const amountSOL = deltaLamports / LAMPORTS_PER_SOL;
                const sender = accountKeys[0]; // Payer / Signer usually first

                console.log(`✨ INHALED: ${amountSOL.toFixed(4)} SOL from ${sender.toBase58()}`);

                await infuseDevnet(devnetConn, sender, amountSOL);
            }

        } catch (error) {
            console.error("❌ Oracle Rupture:", error);
        }
    }, 'confirmed');
}

async function infuseDevnet(connection: Connection, userPubkey: PublicKey, amountSOL: number) {
    const gritAmount = amountSOL * CONFIG.EXCHANGE_RATE;
    console.log(`🌊 INFUSING: ${gritAmount} GRIT to ${userPubkey.toBase58()}`);

    if (!process.env.DEVNET_GOD_KEY) {
        console.warn("⚠️  GOD_WALLET not configured. Skipping actual transfer (Simulated Mode).");
        return;
    }

    try {
        const fromAta = await getOrCreateAssociatedTokenAccount(
            connection,
            CONFIG.GOD_WALLET,
            CONFIG.GRIT_MINT,
            CONFIG.GOD_WALLET.publicKey
        );

        const toAta = await getOrCreateAssociatedTokenAccount(
            connection,
            CONFIG.GOD_WALLET,
            CONFIG.GRIT_MINT,
            userPubkey
        );

        const sig = await transfer(
            connection,
            CONFIG.GOD_WALLET,
            fromAta.address,
            toAta.address,
            CONFIG.GOD_WALLET.publicKey,
            BigInt(Math.floor(gritAmount * 1_000_000_000)) // Assuming 9 decimals
        );

        console.log(`✅ Infusion Complete. Sig: ${sig}`);

    } catch (e) {
        console.error("❌ Infusion Failed:", e);
    }
}

main().catch(console.error);
