const { execSync } = require("child_process");
const fs = require("fs");
const path = require("path");

const TRACKS = [
    { title: "ACTUALLY ACTUALLY", file: "ACTUALLY ACTUALLY.wav", slug: "actually_actually", cd: "actually-actually_cd.png" },
    { title: "CRUSH", file: "CRUSH.wav", slug: "crush", cd: "crush_cd.png" },
    { title: "SEPTA", file: "SEPTA.wav", slug: "septa", cd: "septa_cd.png" },
    { title: "TV", file: "TV.wav", slug: "tv", cd: "tv_cd.png" },
    { title: "VILLIAN STRUT", file: "VILLIAN STRUT.wav", slug: "villian_strut", cd: "villian-strut_cd.png" },
    { title: "WZRD", file: "WZRD.wav", slug: "wzrd", cd: "wzrd_cd.png" }
];

const TIERS = [
    { name: "Common", price: 5, suffix: "_cd.png", supply: 1000 },
    { name: "Rare", price: 100, suffix: "_rare.png", supply: 50 },
    { name: "Epic", price: 500, suffix: "_epic.png", supply: 10 },
    { name: "Legendary", price: 1000, suffix: "_legendary.png", supply: 5 }
];

const IMAGES_DIR = path.join(__dirname, "../public/images");
const MUSIC_DIR = path.join(__dirname, "../public/music");

function main() {
    console.log("🚀 Starting Full Collection Minting...");

    for (const track of TRACKS) {
        console.log(`\n💿 Processing Album: ${track.title}`);

        for (const tier of TIERS) {
            // Determine image path
            let imageFilename = `${track.slug}${tier.suffix}`;
            if (tier.name === "Common") {
                imageFilename = track.cd; // Use the specific CD filename from the track object
            }

            const imagePath = path.join(IMAGES_DIR, imageFilename);
            const audioPath = path.join(MUSIC_DIR, track.file);

            if (!fs.existsSync(imagePath)) {
                console.error(`  ❌ Image missing: ${imageFilename}`);
                continue;
            }

            console.log(`  ✨ Minting ${tier.name} Edition...`);

            // Build command
            // node scripts/add_new_nft.js --title "TITLE" --audio "path" --image "path" --price 100 --rarity "Common"
            try {
                const cmd = `node scripts/add_new_nft.js --title "${track.title}" --audio "${audioPath}" --image "${imagePath}" --price ${tier.price} --rarity "${tier.name}" --supply ${tier.supply}`;
                execSync(cmd, { stdio: "inherit", cwd: path.join(__dirname, "..") });
                console.log(`  ✅ Minted ${tier.name}.`);

                // Sleep to prevent rate limits or race conditions
                execSync("sleep 2");

            } catch (e) {
                console.error(`  ❌ Failed to mint ${tier.name}:`, e.message);
            }
        }
    }
    console.log("\n🏁 Collection Minting Complete!");
}

main();
