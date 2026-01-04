const { Connection, Keypair, PublicKey, Transaction, clusterApiUrl } = require("@solana/web3.js");
const { getAssociatedTokenAddress, createAssociatedTokenAccountInstruction, createTransferInstruction } = require("@solana/spl-token");
const fs = require("fs");
const path = require("path");
require("dotenv").config({ path: path.join(__dirname, "../.env.local") });

// NFT Mint Addresses
const NFT_MINTS = {
    "actually_actually": "De2VCg4QtNni1X4bX7PnWzSiYLF3MxPGJZ4p8hMKN95P",
    "crush": "FvhqpsDH3Q5Uau73z4c6676ghHi4hUmFLSKNDMYxVES9",
    "septa": "CmfRoqvd5VuwccHx2A1NyzVvvoJXjhuUmPEkBa6P9bMX",
    "tv": "3YxNZE8nmpSjCDLf4xXFvf5S1kGepaNBRDyHVsm1w7wC",
    "villian_strut": "Dq4hsV7QSjfxCnkkn5yguTNnyyzEeECk5XYbQ74apUjr",
    "wzrd": "CJeHsQnGBcXG9HCZy5KsbteLQ213ci8EWFZcFbGS6PYz"
};

async function airdropNFTs(network = "devnet", jsonPath) {
    console.log("🎨 NFT Airdrop Script");
    console.log(`Network: ${network}`);
    console.log(`Config: ${jsonPath}\n`);

    // 1. Setup connection
    const connection = new Connection(
        network === "mainnet" ? clusterApiUrl("mainnet-beta") : clusterApiUrl("devnet")
    );

    // 2. Load treasury wallet
    const treasuryPath = path.join(__dirname, "dev-wallet.json");
    if (!fs.existsSync(treasuryPath)) {
        console.error("❌ Treasury wallet not found. Run mint_nfts.js first.");
        return;
    }

    const secretKey = JSON.parse(fs.readFileSync(treasuryPath));
    const treasury = Keypair.fromSecretKey(new Uint8Array(secretKey));
    console.log(`💰 Treasury: ${treasury.publicKey.toBase58()}`);

    // 3. Check treasury balance
    const balance = await connection.getBalance(treasury.publicKey);
    console.log(`   SOL Balance: ${balance / 1e9} SOL\n`);

    // 4. Read recipients from JSON
    const config = JSON.parse(fs.readFileSync(jsonPath, "utf-8"));
    const recipients = config.recipients || [];

    console.log(`📋 Found ${recipients.length} recipients\n`);

    // 5. Process each NFT transfer
    const results = [];

    for (let i = 0; i < recipients.length; i++) {
        const recipient = recipients[i];
        console.log(`\n[${i + 1}/${recipients.length}] Processing ${recipient.wallet}...`);

        try {
            const recipientPubkey = new PublicKey(recipient.wallet);
            const nftMint = new PublicKey(recipient.nft_mint);

            // Get treasury NFT token account
            const treasuryATA = await getAssociatedTokenAddress(nftMint, treasury.publicKey);

            // Verify treasury owns the NFT
            const treasuryAccount = await connection.getTokenAccountBalance(treasuryATA);
            if (treasuryAccount.value.uiAmount !== 1) {
                throw new Error("Treasury does not own this NFT");
            }

            // Get or create recipient token account
            const recipientATA = await getAssociatedTokenAddress(nftMint, recipientPubkey);

            const transaction = new Transaction();

            // Check if recipient account exists
            const accountInfo = await connection.getAccountInfo(recipientATA);
            if (!accountInfo) {
                transaction.add(
                    createAssociatedTokenAccountInstruction(
                        treasury.publicKey,
                        recipientATA,
                        recipientPubkey,
                        nftMint
                    )
                );
            }

            // Add transfer instruction (NFTs have amount of 1)
            transaction.add(
                createTransferInstruction(
                    treasuryATA,
                    recipientATA,
                    treasury.publicKey,
                    1
                )
            );

            // Send transaction
            const signature = await connection.sendTransaction(transaction, [treasury]);
            await connection.confirmTransaction(signature, "confirmed");

            console.log(`✅ NFT transferred successfully`);
            console.log(`   NFT: ${recipient.nft_mint.slice(0, 8)}...`);
            console.log(`   Tx: ${signature.slice(0, 8)}...`);
            console.log(`   Note: ${recipient.note || "N/A"}`);

            results.push({
                wallet: recipient.wallet,
                nft_mint: recipient.nft_mint,
                signature,
                status: "success",
                note: recipient.note
            });

        } catch (error) {
            console.error(`❌ Failed: ${error.message}`);
            results.push({
                wallet: recipient.wallet,
                nft_mint: recipient.nft_mint,
                signature: null,
                status: "failed",
                error: error.message,
                note: recipient.note
            });
        }

        // Small delay between transfers
        if (i < recipients.length - 1) {
            await new Promise(resolve => setTimeout(resolve, 500));
        }
    }

    // 6. Save results
    const timestamp = new Date().toISOString().replace(/[:.]/g, "-");
    const resultsPath = path.join(__dirname, `../nft-airdrop-results-${timestamp}.json`);

    const summary = {
        timestamp: new Date().toISOString(),
        network,
        total_recipients: recipients.length,
        successful: results.filter(r => r.status === "success").length,
        failed: results.filter(r => r.status === "failed").length,
        results
    };

    fs.writeFileSync(resultsPath, JSON.stringify(summary, null, 2));

    console.log(`\n\n📊 NFT Airdrop Summary:`);
    console.log(`   Total: ${summary.total_recipients}`);
    console.log(`   Successful: ${summary.successful}`);
    console.log(`   Failed: ${summary.failed}`);
    console.log(`\n💾 Results saved to: ${resultsPath}`);
}

// CLI Usage
const args = process.argv.slice(2);
const networkArg = args.find(arg => arg.startsWith("--network="));
const fileArg = args.find(arg => arg.startsWith("--file="));

const network = networkArg ? networkArg.split("=")[1] : "devnet";
const jsonPath = fileArg ? fileArg.split("=")[1] : path.join(__dirname, "nft-recipients.json");

if (!fs.existsSync(jsonPath)) {
    console.error(`❌ JSON file not found: ${jsonPath}`);
    console.log("\nUsage: node airdrop_nfts.js --file=nft-recipients.json --network=devnet");
    console.log("\nJSON Format:");
    console.log(JSON.stringify({
        recipients: [
            {
                wallet: "FycgQBYygUY6ZDk3QHPQi9t468VTfTDXTNRRpYkTj3Tr",
                nft_mint: "De2VCg4QtNni1X4bX7PnWzSiYLF3MxPGJZ4p8hMKN95P",
                note: "Early supporter - ACTUALLY ACTUALLY"
            }
        ]
    }, null, 2));
    process.exit(1);
}

airdropNFTs(network, jsonPath);
