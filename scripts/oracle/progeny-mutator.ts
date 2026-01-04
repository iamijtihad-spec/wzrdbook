import { Metaplex, keypairIdentity, bundlrStorage, Nft } from "@metaplex-foundation/js";
import { Connection, Keypair, PublicKey, clusterApiUrl } from "@solana/web3.js";
import fs from "fs";
import path from "path";
import dotenv from "dotenv";

dotenv.config({ path: ".env.local" });

// --- CONFIGURATION ---
const RPC_URL = process.env.NEXT_PUBLIC_SOLANA_RPC_URL || clusterApiUrl("devnet");
const connection = new Connection(RPC_URL, "confirmed");

// Authority Keypair (The Entity that mints/updates the NFTs)
// In a real env, load from a secret file. For Devnet/Hackathon, we might generate or load from env.
const AUTHORITY_KEY = process.env.AUTHORITY_PRIVATE_KEY
    ? Keypair.fromSecretKey(Uint8Array.from(JSON.parse(process.env.AUTHORITY_PRIVATE_KEY)))
    : Keypair.generate(); // Fallback for safety, but won't be able to update specific NFTs unless passing the authority

const metaplex = Metaplex.make(connection)
    .use(keypairIdentity(AUTHORITY_KEY))
    .use(bundlrStorage({ address: 'https://devnet.bundlr.network', providerUrl: RPC_URL, timeout: 60000 }));

// Evolution Tiers (Mocked Metadata URIs for now)
const TIERS = {
    INITIATE: "https://arweave.net/initiate_uri_placeholder",
    SURVIVOR: "https://arweave.net/survivor_uri_placeholder", // +Cracks
    ELDER: "https://arweave.net/elder_uri_placeholder",       // +Gold
    ASCENDED: "https://arweave.net/ascended_uri_placeholder"  // +Radiance
};

// State paths
const USERS_FILE = path.join(process.cwd(), "data", "users.json");

interface UserState {
    wallet: string;
    scars: any[];
    resonance: number;
    nftMint?: string; // We need to store the minted NFT address for the user
}

// Evolution Logic
function calculateTier(user: UserState): string {
    const scarCount = user.scars?.length || 0;
    // Mocking Staking duration check for now (would require fetching on-chain account)
    const isStaking = false;

    if (scarCount >= 5 && isStaking) return TIERS.ASCENDED;
    if (isStaking) return TIERS.ELDER; // Priority on Time? Or needs both?
    // Let's iterate:
    // 1. Initiate (Default)
    // 2. Survivor (> 0 Scars)
    // 3. Elder (> 7 Days Stake - mocked as just "Staking > 0" for now or checking a flag)

    if (scarCount > 0) return TIERS.SURVIVOR;

    return TIERS.INITIATE;
}

// --- ORACLE CORE ---

async function runOracle() {
    console.log("👁️ PROGENY ORACLE: Awakening...");
    console.log(`Authority: ${AUTHORITY_KEY.publicKey.toBase58()}`);

    if (!fs.existsSync(USERS_FILE)) {
        console.log("No user data found. Sleeping.");
        return;
    }

    const users: Record<string, UserState> = JSON.parse(fs.readFileSync(USERS_FILE, "utf-8"));

    for (const [walletAddress, user] of Object.entries(users)) {
        if (!user.nftMint) {
            console.log(`Skipping ${walletAddress.substring(0, 6)}... (No Identity NFT linked)`);
            continue;
        }

        try {
            const targetURI = calculateTier(user);
            const mintAddress = new PublicKey(user.nftMint);

            // Fetch current NFT
            const nft = await metaplex.nfts().findByMint({ mintAddress });

            if (nft.uri === targetURI) {
                // console.log(`Identity Stable: ${walletAddress.substring(0, 6)}...`);
                continue;
            }

            console.log(`⚡ MUTATION DETECTED for ${walletAddress.substring(0, 6)}...`);
            console.log(`   Current: ${nft.uri}`);
            console.log(`   Target:  ${targetURI}`);

            // Update Metadata
            // Note: Authority must sign this.
            await metaplex.nfts().update({
                nftOrSft: nft,
                uri: targetURI,
                name: `WZRD Identity [${getTierName(targetURI)}]`
            });

            console.log("   ✅ Mutation Complete.");

        } catch (e) {
            console.error(`   ❌ Mutation Failed for ${walletAddress}:`, e);
        }
    }
}

function getTierName(uri: string) {
    if (uri === TIERS.ASCENDED) return "Ascended";
    if (uri === TIERS.ELDER) return "Elder";
    if (uri === TIERS.SURVIVOR) return "Survivor";
    return "Initiate";
}

// Execute
runOracle().catch(console.error);
