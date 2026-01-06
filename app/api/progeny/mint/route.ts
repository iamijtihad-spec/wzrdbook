import { NextRequest, NextResponse } from "next/server";
import { Metaplex, keypairIdentity, irysStorage } from "@metaplex-foundation/js";
import { Connection, Keypair, PublicKey, clusterApiUrl } from "@solana/web3.js";
import { StorageEngine } from "@/lib/server/storage";
import { D1Client } from "@/lib/d1";

// CONFIG
const RPC_URL = process.env.NEXT_PUBLIC_SOLANA_RPC_URL || clusterApiUrl("devnet");
const connection = new Connection(RPC_URL, "confirmed");

// AUTHORITY SEED
const AUTHORITY_SECRET_STRING = process.env.PROGENY_AUTHORITY_SECRET;
const MOCK_SECRET = AUTHORITY_SECRET_STRING
    ? Uint8Array.from(JSON.parse(AUTHORITY_SECRET_STRING))
    : Uint8Array.from([
        174, 47, 10, 219, 197, 187, 109, 114, 237, 252, 238, 234, 203, 101, 107, 182,
        182, 126, 215, 62, 214, 240, 162, 53, 193, 195, 230, 238, 59, 187, 150, 48,
        33, 44, 52, 59, 241, 60, 222, 100, 14, 223, 102, 214, 24, 219, 28, 202,
        12, 13, 201, 251, 196, 52, 248, 162, 179, 156, 172, 193, 76, 219, 194, 181
    ]);

// Metadata URIs (From Oracle)
const INITIATE_URI = "https://arweave.net/initiate_uri_placeholder"; // TODO: Replace with real JSON

export async function POST(req: NextRequest) {
    try {
        const AUTHORITY = Keypair.fromSecretKey(MOCK_SECRET);
        const metaplex = Metaplex.make(connection)
            .use(keypairIdentity(AUTHORITY))
            .use(irysStorage({ address: 'https://devnet.irys.xyz', providerUrl: RPC_URL, timeout: 60000 }));

        const body = await req.json();
        const { wallet } = body;

        if (!wallet) return NextResponse.json({ success: false, error: "Missing wallet" }, { status: 400 });

        console.log(`🧬 MINTING IDENTITY for ${wallet}...`);

        // 1. Mint the NFT
        const { nft } = await metaplex.nfts().create({
            uri: INITIATE_URI,
            name: "WZRD Initiate",
            sellerFeeBasisPoints: 0,
            tokenOwner: new PublicKey(wallet), // Mint directly to user
            isCollection: false, // Could add collection later
            isMutable: true, // ESSENTIAL for evolution
        });

        console.log(`✅ Minted: ${nft.address.toBase58()}`);

        const env = (process as any).env;

        // 3. Initialize Evolutionary State
        if (env?.DB) {
            await D1Client.execute(
                `INSERT INTO creature_states (mint, stage, level, xp, hunger, stamina, happiness, last_interaction)
                 VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
                [nft.address.toBase58(), "Egg", 1, 0, 50, 100, 50, Date.now()],
                env
            );
        } else {
            await StorageEngine.update<any>("creature_states", (states) => {
                return {
                    ...states,
                    [nft.address.toBase58()]: {
                        mint: nft.address.toBase58(),
                        stage: "Egg",
                        level: 1,
                        xp: 0,
                        hunger: 50,
                        stamina: 100,
                        happiness: 50,
                        last_interaction: Date.now()
                    }
                };
            }, {}, env);
        }

        return NextResponse.json({
            success: true,
            mint: nft.address.toBase58(),
            tier: "INITIATE"
        });

    } catch (e: any) {
        console.error("Minting Failed:", e);
        return NextResponse.json({ success: false, error: e.message || "Mint failed" }, { status: 500 });
    }
}


export const runtime = 'edge';