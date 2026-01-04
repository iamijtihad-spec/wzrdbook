const { Connection, Keypair, PublicKey, Transaction, clusterApiUrl } = require("@solana/web3.js");
const { getAssociatedTokenAddress, createAssociatedTokenAccountInstruction, createTransferInstruction } = require("@solana/spl-token");
const fs = require("fs");
const path = require("path");

// NFT to send
const NFT_MINT = "De2VCg4QtNni1X4bX7PnWzSiYLF3MxPGJZ4p8hMKN95P"; // ACTUALLY ACTUALLY
const RECIPIENT = process.argv[2];

if (!RECIPIENT) {
    console.error("Usage: node send_nft.js <recipient_address>");
    process.exit(1);
}

async function sendNFT() {
    console.log("🎨 Sending NFT to", RECIPIENT);

    const connection = new Connection(clusterApiUrl("devnet"));

    // Load treasury wallet
    const treasuryPath = path.join(__dirname, "dev-wallet.json");
    const secretKey = JSON.parse(fs.readFileSync(treasuryPath));
    const treasury = Keypair.fromSecretKey(new Uint8Array(secretKey));

    console.log("💰 Treasury:", treasury.publicKey.toBase58());

    const recipientPubkey = new PublicKey(RECIPIENT);
    const nftMintPubkey = new PublicKey(NFT_MINT);

    // Get token accounts
    const treasuryNFTAccount = await getAssociatedTokenAddress(nftMintPubkey, treasury.publicKey);
    const recipientNFTAccount = await getAssociatedTokenAddress(nftMintPubkey, recipientPubkey);

    const transaction = new Transaction();

    // Check if recipient account exists
    const accountInfo = await connection.getAccountInfo(recipientNFTAccount);
    if (!accountInfo) {
        console.log("Creating token account for recipient...");
        transaction.add(
            createAssociatedTokenAccountInstruction(
                treasury.publicKey,
                recipientNFTAccount,
                recipientPubkey,
                nftMintPubkey
            )
        );
    }

    // Add transfer
    console.log("Adding transfer instruction...");
    transaction.add(
        createTransferInstruction(
            treasuryNFTAccount,
            recipientNFTAccount,
            treasury.publicKey,
            1
        )
    );

    // Send
    console.log("Sending transaction...");
    const signature = await connection.sendTransaction(transaction, [treasury]);
    console.log("✅ Transaction sent:", signature);
    console.log("🔍 Explorer:", `https://explorer.solana.com/tx/${signature}?cluster=devnet`);

    console.log("\n⏳ Waiting for confirmation...");
    await connection.confirmTransaction(signature, "confirmed");
    console.log("✅ NFT transferred successfully!");
}

sendNFT().catch(console.error);
