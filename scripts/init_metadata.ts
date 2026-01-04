import { Metaplex, keypairIdentity } from "@metaplex-foundation/js";
import { Connection, clusterApiUrl, Keypair, PublicKey } from "@solana/web3.js";
import * as fs from "fs";
import * as path from "path";

async function main() {
    // 1. Setup Connection & Wallet
    const connection = new Connection("https://api.devnet.solana.com", "confirmed");
    const keypairPath = path.resolve(process.env.HOME || "", ".config/solana/id.json");
    const secretKey = Uint8Array.from(JSON.parse(fs.readFileSync(keypairPath, "utf-8")));
    const wallet = Keypair.fromSecretKey(secretKey);

    console.log("Wallet:", wallet.publicKey.toBase58());

    // 2. Setup Metaplex
    const metaplex = Metaplex.make(connection)
        .use(keypairIdentity(wallet));

    // 3. Define Tokens
    const TOKENS = [
        {
            name: "MOXY",
            symbol: "MXY",
            uri: "https://wzrdbook.com/metadata/moxy.json",
            mint: new PublicKey("2FFhBNoCqsgXejrqQXk3gJXWyG9nuiE7qj4Sv2wrcnwq")
        },
        {
            name: "CHI",
            symbol: "CHI",
            uri: "https://wzrdbook.com/metadata/chi.json",
            mint: new PublicKey("5Z5YkiXqBQyVaz8dhrM2DCDynnmNkaFa7AZDoHchQtEj")
        }
    ];

    // 4. Create Metadata
    for (const token of TOKENS) {
        console.log(`\nInitializing Metadata for ${token.symbol}...`);

        // Check if metadata already exists
        const pda = metaplex.nfts().pdas().metadata({ mint: token.mint });
        const info = await connection.getAccountInfo(pda);

        try {
            if (info) {
                console.log(`Metadata already exists for ${token.symbol}. Updating...`);
                // Find the NFT/SFT model
                const nft = await metaplex.nfts().findByMint({ mintAddress: token.mint });

                await metaplex.nfts().update({
                    nftOrSft: nft,
                    name: token.name,
                    symbol: token.symbol,
                    uri: token.uri,
                });
                console.log("Updated!");
            } else {
                console.log(`Creating new metadata for ${token.symbol}...`);
                await metaplex.nfts().createSft({
                    uri: token.uri,
                    name: token.name,
                    symbol: token.symbol,
                    sellerFeeBasisPoints: 0,
                    // For fungible tokens, we generally want Mutable metadata
                    isMutable: true,
                    useExistingMint: token.mint,
                    tokenOwner: wallet.publicKey,
                });
                console.log("Created!");
            }
        } catch (e: any) {
            if (e.name === "NoInstructionsToSendError" || e.message?.includes("NoInstructionsToSendError")) {
                console.log(`Skipping ${token.symbol}: Metadata already up to date.`);
            } else {
                console.error(`Failed to process ${token.symbol}:`, e);
            }
        }
    }
}

main().catch(console.error);
