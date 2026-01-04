const { Connection, Keypair, PublicKey, Transaction, clusterApiUrl, sendAndConfirmTransaction } = require("@solana/web3.js");
const { createMint, getOrCreateAssociatedTokenAccount, mintTo } = require("@solana/spl-token");
const {
    createCreateMetadataAccountV3Instruction,
    createCreateMasterEditionV3Instruction,
    createVerifyCollectionInstruction,
    createVerifySizedCollectionItemInstruction
} = require("@metaplex-foundation/mpl-token-metadata");
const fs = require("fs");
const path = require("path");

const R2_PUBLIC_URL = "https://pub-1aa7bb22d4509ba4b29cfc9418424695.r2.dev";
const TOKEN_METADATA_PROGRAM_ID = new PublicKey("metaqbxxUerdq28cj1RbAWkYQm3ybzjb6a8bt518x1s");

const TRACKS = [
    { title: "ACTUALLY ACTUALLY", file: "actually_actually.json", symbol: "WZRD" },
    { title: "CRUSH", file: "crush.json", symbol: "WZRD" },
    { title: "SEPTA", file: "septa.json", symbol: "WZRD" },
    { title: "TV", file: "tv.json", symbol: "WZRD" },
    { title: "VILLIAN STRUT", file: "villian_strut.json", symbol: "WZRD" },
    { title: "WZRD", file: "wzrd.json", symbol: "WZRD" }
];

async function createVerifiedCollection() {
    const connection = new Connection(clusterApiUrl("devnet"), "confirmed");

    // Load treasury
    const treasuryPath = path.join(__dirname, "dev-wallet.json");
    const secretKey = JSON.parse(fs.readFileSync(treasuryPath));
    const treasury = Keypair.fromSecretKey(new Uint8Array(secretKey));

    console.log("💰 Treasury:", treasury.publicKey.toBase58());
    console.log("----------------------------------------");

    // Helper for delay
    const delay = ms => new Promise(resolve => setTimeout(resolve, ms));

    // 1. Create Collection Parent NFT
    console.log("\n📦 Creating Collection Parent NFT...");
    const collectionMint = await createMint(connection, treasury, treasury.publicKey, treasury.publicKey, 0);
    const collectionTokenAccount = await getOrCreateAssociatedTokenAccount(connection, treasury, collectionMint, treasury.publicKey);
    await mintTo(connection, treasury, collectionMint, collectionTokenAccount.address, treasury, 1);

    const [collectionMetadataPDA] = PublicKey.findProgramAddressSync(
        [Buffer.from("metadata"), TOKEN_METADATA_PROGRAM_ID.toBuffer(), collectionMint.toBuffer()],
        TOKEN_METADATA_PROGRAM_ID
    );
    const [collectionMasterEditionPDA] = PublicKey.findProgramAddressSync(
        [Buffer.from("metadata"), TOKEN_METADATA_PROGRAM_ID.toBuffer(), collectionMint.toBuffer(), Buffer.from("edition")],
        TOKEN_METADATA_PROGRAM_ID
    );

    const collectionMetadata = {
        name: "GRITCOIN Collection",
        symbol: "GRIT",
        uri: `${R2_PUBLIC_URL} /metadata/collection.json`, // Assuming this exists or using a placeholder
        sellerFeeBasisPoints: 0,
        creators: [{ address: treasury.publicKey, verified: true, share: 100 }],
        collection: null,
        uses: null,
    };

    const createCollectionTx = new Transaction().add(
        createCreateMetadataAccountV3Instruction(
            {
                metadata: collectionMetadataPDA,
                mint: collectionMint,
                mintAuthority: treasury.publicKey,
                payer: treasury.publicKey,
                updateAuthority: treasury.publicKey,
            },
            {
                createMetadataAccountArgsV3: {
                    data: collectionMetadata,
                    isMutable: true,
                    collectionDetails: { __kind: "V1", size: 0 }, // This makes it a collection parent
                },
            }
        ),
        createCreateMasterEditionV3Instruction(
            {
                edition: collectionMasterEditionPDA,
                mint: collectionMint,
                updateAuthority: treasury.publicKey,
                mintAuthority: treasury.publicKey,
                payer: treasury.publicKey,
                metadata: collectionMetadataPDA,
            },
            { createMasterEditionArgs: { maxSupply: 0 } }
        )
    );

    await sendAndConfirmTransaction(connection, createCollectionTx, [treasury]);
    console.log(`✅ Collection Parent Created: ${collectionMint.toBase58()} `);

    // 2. Mint Items and Verify
    const newMints = {};

    for (const track of TRACKS) {
        console.log(`\n🎵 Processing: ${track.title} `);
        await delay(2000); // Wait 2s between mints

        const mint = await createMint(connection, treasury, treasury.publicKey, treasury.publicKey, 0);
        const tokenAccount = await getOrCreateAssociatedTokenAccount(connection, treasury, mint, treasury.publicKey);
        await mintTo(connection, treasury, mint, tokenAccount.address, treasury, 1);
        newMints[track.title] = mint.toBase58();

        const [metadataPDA] = PublicKey.findProgramAddressSync(
            [Buffer.from("metadata"), TOKEN_METADATA_PROGRAM_ID.toBuffer(), mint.toBuffer()],
            TOKEN_METADATA_PROGRAM_ID
        );
        const [masterEditionPDA] = PublicKey.findProgramAddressSync(
            [Buffer.from("metadata"), TOKEN_METADATA_PROGRAM_ID.toBuffer(), mint.toBuffer(), Buffer.from("edition")],
            TOKEN_METADATA_PROGRAM_ID
        );

        const metadataData = {
            name: track.title,
            symbol: track.symbol,
            uri: `${R2_PUBLIC_URL} /metadata/${track.file} `,
            sellerFeeBasisPoints: 0,
            creators: [{ address: treasury.publicKey, verified: true, share: 100 }],
            collection: { key: collectionMint, verified: false }, // Set collection, verified=false initially
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
            ),
            createCreateMasterEditionV3Instruction(
                {
                    edition: masterEditionPDA,
                    mint: mint,
                    updateAuthority: treasury.publicKey,
                    mintAuthority: treasury.publicKey,
                    payer: treasury.publicKey,
                    metadata: metadataPDA,
                },
                { createMasterEditionArgs: { maxSupply: 0 } }
            ),
            createVerifySizedCollectionItemInstruction({
                metadata: metadataPDA,
                collectionAuthority: treasury.publicKey,
                payer: treasury.publicKey,
                collectionMint: collectionMint,
                collection: collectionMetadataPDA,
                collectionMasterEditionAccount: collectionMasterEditionPDA,
            })
        );

        await sendAndConfirmTransaction(connection, tx, [treasury]);
        console.log(`✅ Minted & Verified: ${mint.toBase58()} `);
    }

    console.log("\n----------------------------------------");
    console.log("🎉 Verified Collection Created!");
    console.log("👉 UPDATE YOUR CODE WITH THESE MINTS:");
    console.log(JSON.stringify(newMints, null, 2));
}

createVerifiedCollection().catch(console.error);
