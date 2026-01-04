const { Connection, Keypair, PublicKey, Transaction, clusterApiUrl } = require("@solana/web3.js");
const { getAssociatedTokenAddress, createAssociatedTokenAccountInstruction, createTransferInstruction, getMint } = require("@solana/spl-token");
const fs = require("fs");
const path = require("path");
const csv = require("csv-parser");
require("dotenv").config({ path: path.join(__dirname, "../.env.local") });

// Configuration
const GRIT_MINT = "CS8ZQMdJ5t5hNuM51LXJBU4zBysZWAkFj9oJ6MwtnHsS";
const BATCH_SIZE = 20; // Process 20 recipients per batch
const DELAY_MS = 1000; // 1 second delay between batches

async function readCSV(filePath) {
    const recipients = [];

    return new Promise((resolve, reject) => {
        fs.createReadStream(filePath)
            .pipe(csv())
            .on("data", (row) => {
                recipients.push({
                    wallet: row.wallet_address,
                    amount: parseFloat(row.amount),
                    note: row.note || ""
                });
            })
            .on("end", () => resolve(recipients))
            .on("error", reject);
    });
}

async function airdropGRIT(network = "devnet", csvPath) {
    console.log("🚀 GRIT Token Airdrop Script");
    console.log(`Network: ${network}`);
    console.log(`CSV: ${csvPath}\n`);

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

    // 4. Get GRIT mint info
    const mintPubkey = new PublicKey(GRIT_MINT);
    const mintInfo = await getMint(connection, mintPubkey);
    const decimals = mintInfo.decimals;

    // 5. Read recipients from CSV
    const recipients = await readCSV(csvPath);
    console.log(`📋 Found ${recipients.length} recipients\n`);

    // 6. Validate recipients
    const validRecipients = [];
    for (const recipient of recipients) {
        try {
            new PublicKey(recipient.wallet);
            if (recipient.amount > 0) {
                validRecipients.push(recipient);
            } else {
                console.warn(`⚠️  Skipping ${recipient.wallet}: invalid amount`);
            }
        } catch {
            console.warn(`⚠️  Skipping ${recipient.wallet}: invalid address`);
        }
    }

    console.log(`✅ ${validRecipients.length} valid recipients\n`);

    // 7. Process in batches
    const results = [];
    const batches = [];

    for (let i = 0; i < validRecipients.length; i += BATCH_SIZE) {
        batches.push(validRecipients.slice(i, i + BATCH_SIZE));
    }

    console.log(`📦 Processing ${batches.length} batches...\n`);

    for (let batchIndex = 0; batchIndex < batches.length; batchIndex++) {
        const batch = batches[batchIndex];
        console.log(`\n--- Batch ${batchIndex + 1}/${batches.length} ---`);

        for (const recipient of batch) {
            try {
                const recipientPubkey = new PublicKey(recipient.wallet);
                const amount = Math.floor(recipient.amount * Math.pow(10, decimals));

                // Get treasury token account
                const treasuryATA = await getAssociatedTokenAddress(mintPubkey, treasury.publicKey);

                // Get or create recipient token account
                const recipientATA = await getAssociatedTokenAddress(mintPubkey, recipientPubkey);

                const transaction = new Transaction();

                // Check if recipient account exists
                const accountInfo = await connection.getAccountInfo(recipientATA);
                if (!accountInfo) {
                    transaction.add(
                        createAssociatedTokenAccountInstruction(
                            treasury.publicKey,
                            recipientATA,
                            recipientPubkey,
                            mintPubkey
                        )
                    );
                }

                // Add transfer instruction
                transaction.add(
                    createTransferInstruction(
                        treasuryATA,
                        recipientATA,
                        treasury.publicKey,
                        amount
                    )
                );

                // Send transaction
                const signature = await connection.sendTransaction(transaction, [treasury]);
                await connection.confirmTransaction(signature, "confirmed");

                console.log(`✅ ${recipient.wallet}: ${recipient.amount} GRIT`);
                console.log(`   Tx: ${signature.slice(0, 8)}...`);

                results.push({
                    wallet: recipient.wallet,
                    amount: recipient.amount,
                    signature,
                    status: "success",
                    note: recipient.note
                });

            } catch (error) {
                console.error(`❌ ${recipient.wallet}: ${error.message}`);
                results.push({
                    wallet: recipient.wallet,
                    amount: recipient.amount,
                    signature: null,
                    status: "failed",
                    error: error.message,
                    note: recipient.note
                });
            }
        }

        // Delay between batches
        if (batchIndex < batches.length - 1) {
            console.log(`\n⏳ Waiting ${DELAY_MS}ms before next batch...`);
            await new Promise(resolve => setTimeout(resolve, DELAY_MS));
        }
    }

    // 8. Save results
    const timestamp = new Date().toISOString().replace(/[:.]/g, "-");
    const resultsPath = path.join(__dirname, `../airdrop-results-${timestamp}.json`);

    const summary = {
        timestamp: new Date().toISOString(),
        network,
        total_recipients: validRecipients.length,
        successful: results.filter(r => r.status === "success").length,
        failed: results.filter(r => r.status === "failed").length,
        total_amount: results.filter(r => r.status === "success").reduce((sum, r) => sum + r.amount, 0),
        results
    };

    fs.writeFileSync(resultsPath, JSON.stringify(summary, null, 2));

    console.log(`\n\n📊 Airdrop Summary:`);
    console.log(`   Total: ${summary.total_recipients}`);
    console.log(`   Successful: ${summary.successful}`);
    console.log(`   Failed: ${summary.failed}`);
    console.log(`   Total GRIT: ${summary.total_amount}`);
    console.log(`\n💾 Results saved to: ${resultsPath}`);
}

// CLI Usage
const args = process.argv.slice(2);
const networkArg = args.find(arg => arg.startsWith("--network="));
const fileArg = args.find(arg => arg.startsWith("--file="));

const network = networkArg ? networkArg.split("=")[1] : "devnet";
const csvPath = fileArg ? fileArg.split("=")[1] : path.join(__dirname, "recipients.csv");

if (!fs.existsSync(csvPath)) {
    console.error(`❌ CSV file not found: ${csvPath}`);
    console.log("\nUsage: node airdrop_grit.js --file=recipients.csv --network=devnet");
    console.log("\nCSV Format:");
    console.log("wallet_address,amount,note");
    console.log("FycgQBYygUY6ZDk3QHPQi9t468VTfTDXTNRRpYkTj3Tr,1000,Early supporter");
    process.exit(1);
}

airdropGRIT(network, csvPath);
