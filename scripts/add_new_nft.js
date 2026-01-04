#!/usr/bin/env node

/**
 * Automated NFT Creation Script
 * 
 * Usage:
 *   node scripts/add_new_nft.js --title "SONG NAME" --audio "path/to/song.wav" --image "path/to/cover.png" --price 100 --supply 1000
 * 
 * This script will:
 * 1. Upload image to R2
 * 2. Upload audio to R2
 * 3. Generate metadata JSON
 * 4. Upload metadata to R2
 * 5. Mint NFT with metadata
 * 6. Update config/nfts.json
 */

const { Connection, Keypair, clusterApiUrl } = require("@solana/web3.js");
const { createMint, getOrCreateAssociatedTokenAccount, mintTo } = require("@solana/spl-token");
const { createCreateMetadataAccountV3Instruction } = require("@metaplex-foundation/mpl-token-metadata");
const { PublicKey, Transaction, sendAndConfirmTransaction } = require("@solana/web3.js");
const fs = require("fs");
const path = require("path");
const { S3Client, PutObjectCommand } = require("@aws-sdk/client-s3");
require("dotenv").config({ path: ".env.local" });

// Parse command line arguments
const args = process.argv.slice(2);
const getArg = (name) => {
    const index = args.indexOf(`--${name}`);
    return index !== -1 ? args[index + 1] : null;
};

const title = getArg("title");
const audioPath = getArg("audio");
const imagePath = getArg("image");
const price = parseInt(getArg("price") || "100");
const rarity = getArg("rarity") || "Common";
const symbol = getArg("symbol") || "WZRD";
const supply = parseInt(getArg("supply") || "1");

if (!title || !audioPath || !imagePath) {
    console.error("❌ Missing required arguments!");
    console.log("\nUsage:");
    console.log("  node scripts/add_new_nft.js --title \"SONG NAME\" --audio \"path/to/song.wav\" --image \"path/to/cover.png\" --price 100 --supply 1000");
    console.log("\nOptional arguments:");
    console.log("  --rarity \"Common|Rare|Epic\" (default: Common)");
    console.log("  --symbol \"SYMBOL\" (default: WZRD)");
    process.exit(1);
}

// Validate files exist
if (!fs.existsSync(audioPath)) {
    console.error(`❌ Audio file not found: ${audioPath}`);
    process.exit(1);
}
if (!fs.existsSync(imagePath)) {
    console.error(`❌ Image file not found: ${imagePath}`);
    process.exit(1);
}

const R2_PUBLIC_URL = "https://pub-1aa7bb22d4509ba4b29cfc9418424695.r2.dev";
const TOKEN_METADATA_PROGRAM_ID = new PublicKey("metaqbxxUerdq28cj1RbAWkYQm3ybzjb6a8bt518x1s");

async function uploadToR2(filePath, key) {
    console.log(`📤 Uploading ${key} to R2...`);

    // Load R2 credentials from environment
    const s3Client = new S3Client({
        region: "auto",
        endpoint: process.env.R2_ENDPOINT,
        credentials: {
            accessKeyId: process.env.R2_ACCESS_KEY_ID,
            secretAccessKey: process.env.R2_SECRET_ACCESS_KEY,
        },
    });

    const fileContent = fs.readFileSync(filePath);
    const contentType = key.endsWith('.json') ? 'application/json' :
        key.endsWith('.png') ? 'image/png' :
            key.endsWith('.wav') ? 'audio/wav' : 'application/octet-stream';

    await s3Client.send(new PutObjectCommand({
        Bucket: process.env.R2_BUCKET_NAME,
        Key: key,
        Body: fileContent,
        ContentType: contentType,
    }));

    console.log(`✅ Uploaded: ${R2_PUBLIC_URL}/${key}`);
    return `${R2_PUBLIC_URL}/${key}`;
}

async function createNFT() {
    console.log("\n🚀 Starting NFT Creation Process...");
    console.log("----------------------------------------");
    console.log(`Title: ${title}`);
    console.log(`Price: ${price} GRIT`);
    console.log(`Rarity: ${rarity}`);
    console.log("----------------------------------------\n");

    // Generate file names
    const titleSlug = title.toLowerCase().replace(/\s+/g, '_');
    const imageFileName = path.basename(imagePath);
    const audioFileName = `${title}.wav`;
    const metadataFileName = `${titleSlug}_${rarity.toLowerCase()}.json`;

    // Step 1 & 2: Upload image and audio to R2
    const imageUrl = await uploadToR2(imagePath, `images/${imageFileName}`);
    const audioUrl = await uploadToR2(audioPath, `music/${audioFileName}`);

    // Step 3: Generate metadata JSON
    console.log("\n📝 Generating metadata...");
    const metadata = {
        name: title,
        symbol: symbol,
        description: `${title} - Exclusive GRITCOIN Music NFT`,
        image: imageUrl,
        animation_url: audioUrl,
        external_url: "https://gritcoin.io",
        attributes: [
            { trait_type: "Artist", value: "GRITCOIN" },
            { trait_type: "Type", value: "Music" },
            { trait_type: "Rarity", value: rarity },
            { trait_type: "Price", value: `${price} GRIT` }
        ],
        properties: {
            files: [
                { uri: imageUrl, type: "image/png" },
                { uri: audioUrl, type: "audio/wav" }
            ],
            category: "audio"
        }
    };

    const metadataPath = path.join(__dirname, "../public/nfts/metadata", metadataFileName);
    fs.writeFileSync(metadataPath, JSON.stringify(metadata, null, 2));
    console.log(`✅ Metadata saved: ${metadataPath}`);

    // Step 4: Upload metadata to R2
    const metadataUrl = await uploadToR2(metadataPath, `metadata/${metadataFileName}`);

    // Step 5: Mint NFT
    console.log(`\n🎨 Minting SFT with Supply: ${supply}...`);
    const connection = new Connection(clusterApiUrl("devnet"), "confirmed");

    const treasuryPath = path.join(__dirname, "dev-wallet.json");
    const secretKey = JSON.parse(fs.readFileSync(treasuryPath));
    const treasury = Keypair.fromSecretKey(new Uint8Array(secretKey));

    const mint = await createMint(connection, treasury, treasury.publicKey, treasury.publicKey, 0);
    const tokenAccount = await getOrCreateAssociatedTokenAccount(connection, treasury, mint, treasury.publicKey);
    await mintTo(connection, treasury, mint, tokenAccount.address, treasury, supply);

    console.log(`✅ Minted: ${mint.toBase58()} (Supply: ${supply})`);

    // Attach metadata
    const [metadataPDA] = PublicKey.findProgramAddressSync(
        [Buffer.from("metadata"), TOKEN_METADATA_PROGRAM_ID.toBuffer(), mint.toBuffer()],
        TOKEN_METADATA_PROGRAM_ID
    );

    const metadataData = {
        name: title,
        symbol: symbol,
        uri: metadataUrl,
        sellerFeeBasisPoints: 0,
        creators: [{ address: treasury.publicKey, verified: true, share: 100 }],
        collection: null,
        uses: null,
    };

    const tx = new Transaction().add(
        createCreateMetadataAccountV3Instruction(
            {
                metadata: metadataPDA,
                mint: mint,
                mintAuthority: treasury.publicKey,
                payer: treasury.publicKey,
                updateAuthority: treasury.publicKey,
            },
            {
                createMetadataAccountArgsV3: {
                    data: metadataData,
                    isMutable: true,
                    collectionDetails: null,
                },
            }
        )
    );

    await sendAndConfirmTransaction(connection, tx, [treasury]);
    console.log("✅ Metadata attached");

    // Step 6: Update config/nfts.json
    console.log("\n📋 Updating config...");
    const configPath = path.resolve(__dirname, "../config/nfts.json");
    console.log(`Debug: Writing to ${configPath}`);

    // Read
    let configStr = fs.readFileSync(configPath, "utf-8");
    let config = JSON.parse(configStr);

    config.tracks.push({
        title: title,
        mint: mint.toBase58(),
        price: price,
        rarity: rarity,
        metadataFile: metadataFileName,
        imageFile: imageFileName,
        audioFile: audioFileName,
        symbol: symbol,
        supply: supply
    });

    // Write
    fs.writeFileSync(configPath, JSON.stringify(config, null, 2));
    console.log("✅ Config updated successfully");

    console.log("\n🎉 NFT Creation Complete!");
    console.log("----------------------------------------");
    console.log(`Mint Address: ${mint.toBase58()}`);
    console.log(`Metadata: ${metadataUrl}`);
    console.log(`Image: ${imageUrl}`);
    console.log(`Audio: ${audioUrl}`);
    console.log("----------------------------------------");
    console.log("\n✨ Your NFT is ready to claim!");
}

createNFT().catch(console.error);
