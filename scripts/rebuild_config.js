const { Connection, PublicKey } = require("@solana/web3.js");
const { Metaplex, keypairIdentity } = require("@metaplex-foundation/js");
const fs = require("fs");
const path = require("path");

// Load Treasury Wallet
const WALLET_PATH = path.join(__dirname, "dev-wallet.json");
const wallet = JSON.parse(fs.readFileSync(WALLET_PATH, "utf-8"));
const secretKey = new Uint8Array(wallet);
const keypair = require("@solana/web3.js").Keypair.fromSecretKey(secretKey);

// Config
const NFTS_JSON_PATH = path.join(__dirname, "../config/nfts.json");

async function main() {
    console.log("🚀 Starting Config Reconstruction...");
    console.log(`Treasury Public Key: ${keypair.publicKey.toBase58()}`);

    const connection = new Connection("https://api.devnet.solana.com", "confirmed");
    const metaplex = Metaplex.make(connection).use(keypairIdentity(keypair));

    console.log("🔍 Fetching all NFTs by owner...");
    const nfts = await metaplex.nfts().findAllByOwner({ owner: keypair.publicKey });

    console.log(`found ${nfts.length} NFTs`);

    const tracks = [];

    // Filter for our tracks to avoid clutter if any
    const KNOWN_TITLES = ["ACTUALLY ACTUALLY", "CRUSH", "SEPTA", "TV", "VILLIAN STRUT", "WZRD"];

    for (const nft of nfts) {
        if (!nft.name || !nft.uri) continue;
        if (!KNOWN_TITLES.includes(nft.name)) continue;

        console.log(`Processing: ${nft.name} (${nft.mintAddress})`);

        let rarity = "Common"; // Default rarity
        let price = 0;          // Default price
        let supply = 1;         // Default supply

        let maxSupply = 0;

        // Try to get supply from Metaplex object directly
        if (nft.edition && nft.edition.maxSupply) {
            maxSupply = nft.edition.maxSupply.toNumber();
            console.log(`  Supply from Chain: ${maxSupply}`);
        } else if (nft.mint && nft.mint.supply) {
            // For SFT (FungibleAsset), supply is on mint
            // We need to fetch Mint info if not fully loaded?
            // Metaplex findAllByOwner might return limited info.
            // We can assume SFT supply is the amount we hold? (Since we hold 100%)
            // nft.token.amount?
            // But we want MAX supply.
        }

        let metadata = {};
        try {
            console.log(`  Fetching: ${nft.uri}`);
            const response = await fetch(nft.uri);
            if (!response.ok) throw new Error(`HTTP ${response.status}`);
            metadata = await response.json();
        } catch (e) {
            console.error(`  ❌ Failed to fetch metadata: ${e.message}`);
            // Fallback strategy: Infer from Max Supply or Title
            if (maxSupply === 5) { rarity = "Legendary"; price = 1000; }
            else if (maxSupply === 10) { rarity = "Epic"; price = 500; }
            else if (maxSupply === 50) { rarity = "Rare"; price = 100; }
            else if (maxSupply === 1000) { rarity = "Common"; price = 5; }

            // If we can't fetch metadata, we assume defaults if supply matches.
            // If we don't know supply, we skip?
            if (maxSupply > 0) {
                supply = maxSupply;
                console.log("  ⚠️  Recovered using Supply Map");
            } else {
                continue;
            }
        }

        if (Object.keys(metadata).length > 0) {
            const rarityAttr = metadata.attributes?.find(a => a.trait_type === "Rarity");
            rarity = rarityAttr ? rarityAttr.value : rarity; // Use metadata rarity if available, else keep fallback

            const priceAttr = metadata.attributes?.find(a => a.trait_type === "Price");
            if (priceAttr) {
                price = parseInt(priceAttr.value.toString().replace(/\D/g, '')); // Use metadata price if available, else keep fallback
            }

            // If we have metadata, we trust its attributes, but supply is separate.
            // For SFT, supply is what we minted.
            const supplyMap = { "Common": 1000, "Rare": 50, "Epic": 10, "Legendary": 5 };
            supply = supplyMap[rarity] || 1; // Recalculate supply based on (potentially updated) rarity from metadata
        }

        // Determine filenames
        const slugMap = {
            "ACTUALLY ACTUALLY": "actually_actually",
            "CRUSH": "crush",
            "SEPTA": "septa",
            "TV": "tv",
            "VILLIAN STRUT": "villian_strut",
            "WZRD": "wzrd"
        };
        const slug = slugMap[nft.name] || nft.name.toLowerCase().replace(/ /g, "_");
        const localAudioFile = `${nft.name}.wav`;

        let localImageFile = `${slug}_${rarity.toLowerCase()}.png`;
        if (rarity === "Common") {
            if (nft.name === "ACTUALLY ACTUALLY") localImageFile = "actually-actually_cd.png";
            else if (nft.name === "VILLIAN STRUT") localImageFile = "villian-strut_cd.png";
            else localImageFile = `${slug}_cd.png`;
        }

        tracks.push({
            title: nft.name,
            mint: nft.mintAddress.toBase58(),
            price: price,
            rarity: rarity,
            metadataFile: nft.uri.split("/").pop(),
            imageFile: localImageFile,
            audioFile: localAudioFile,
            symbol: nft.symbol || "WZRD",
            supply: supply
        });
    }

    // Sort
    tracks.sort((a, b) => {
        if (a.title === b.title) return a.price - b.price;
        return a.title.localeCompare(b.title);
    });

    console.log(`✅ Reconstructed ${tracks.length} tracks.`);
    fs.writeFileSync(NFTS_JSON_PATH, JSON.stringify({ tracks }, null, 2));
    console.log("💾 Saved to config/nfts.json");
}

main().catch(err => {
    console.error(err);
    process.exit(1);
});
