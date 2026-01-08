import { NextRequest, NextResponse } from "next/server";
import { Connection, PublicKey, Transaction, clusterApiUrl, Keypair } from "@solana/web3.js";
import { getAssociatedTokenAddress, createAssociatedTokenAccountInstruction, createTransferInstruction, getAccount } from "@solana/spl-token";
import { getNFTPrices } from "@/lib/nft-config";


const GRIT_MINT = "CS8ZQMdJ5t5hNuM51LXJBU4zBysZWAkFj9oJ6MwtnHsS";

// Load NFT prices from centralized config
const NFT_PRICES = getNFTPrices();

export async function POST(request: NextRequest) {
    try {
        const body = await request.json();
        const { claimerAddress, nftMint } = body;

        if (!claimerAddress || !nftMint) {
            return NextResponse.json(
                { error: "Missing required fields" },
                { status: 400 }
            );
        }

        // Validate addresses
        const claimerPubkey = new PublicKey(claimerAddress);
        const nftMintPubkey = new PublicKey(nftMint);
        const gritMintPubkey = new PublicKey(GRIT_MINT);

        // Get required GRIT balance
        const requiredGRIT = NFT_PRICES[nftMint];
        if (!requiredGRIT) {
            return NextResponse.json(
                { error: "Invalid NFT mint address" },
                { status: 400 }
            );
        }

        // Connect to Solana
        const connection = new Connection(clusterApiUrl("devnet"));

        // Check claimer's GRIT balance
        const claimerGRITAccount = await getAssociatedTokenAddress(gritMintPubkey, claimerPubkey);

        try {
            const accountInfo = await getAccount(connection, claimerGRITAccount);
            const balance = Number(accountInfo.amount) / 1e9; // Assuming 9 decimals

            if (balance < requiredGRIT) {
                return NextResponse.json(
                    { error: `Insufficient GRIT balance. Required: ${requiredGRIT}, Available: ${balance.toFixed(2)}` },
                    { status: 400 }
                );
            }
        } catch (err) {
            return NextResponse.json(
                { error: "No GRIT token account found. Please acquire GRIT tokens first." },
                { status: 400 }
            );
        }

        // Load treasury wallet
        // LOAD TREASURY (Priority: Env -> File)
        let treasury: Keypair;
        const treasuryPath = path.join(process.cwd(), "scripts/dev-wallet.json");

        if (process.env.TREASURY_SECRET) {
            const secret = process.env.TREASURY_SECRET;
            if (secret.startsWith('[')) {
                treasury = Keypair.fromSecretKey(Uint8Array.from(JSON.parse(secret)));
            } else {
                throw new Error("Invalid TREASURY_SECRET format"); // Catch below
            }
            // } else if (fs.existsSync(treasuryPath)) {
            //     const secretKey = JSON.parse(fs.readFileSync(treasuryPath, "utf-8"));
            //     treasury = Keypair.fromSecretKey(new Uint8Array(secretKey));
            // } 
        } else {
            return NextResponse.json(
                { error: "Treasury wallet not configured (File or Env missing)" },
                { status: 500 }
            );
        }

        // Transfer NFT to claimer
        const transaction = new Transaction();

        // Get treasury NFT token account
        const treasuryNFTAccount = await getAssociatedTokenAddress(nftMintPubkey, treasury.publicKey);

        // Check Treasury Balance (Availability)
        try {
            const treasuryAccountObj = await getAccount(connection, treasuryNFTAccount);
            if (Number(treasuryAccountObj.amount) === 0) {
                return NextResponse.json(
                    { error: "Sold Out! This artifact has been fully claimed." },
                    { status: 400 }
                );
            }
        } catch (e) {
            console.error("Treasury account check failed:", e);
            return NextResponse.json(
                { error: "Artifact unavailable in Treasury." },
                { status: 404 }
            );
        }

        // Get or create claimer NFT token account
        const claimerNFTAccount = await getAssociatedTokenAddress(nftMintPubkey, claimerPubkey);

        const accountInfo = await connection.getAccountInfo(claimerNFTAccount);
        if (!accountInfo) {
            transaction.add(
                createAssociatedTokenAccountInstruction(
                    treasury.publicKey,
                    claimerNFTAccount,
                    claimerPubkey,
                    nftMintPubkey
                )
            );
        }

        // Add NFT transfer instruction
        transaction.add(
            createTransferInstruction(
                treasuryNFTAccount,
                claimerNFTAccount,
                treasury.publicKey,
                1 // NFTs have amount of 1
            )
        );

        console.log("Sending NFT transfer transaction...");

        // Send transaction
        const signature = await connection.sendTransaction(transaction, [treasury], {
            skipPreflight: false,
            preflightCommitment: "confirmed"
        });

        console.log("Transaction sent:", signature);
        console.log("Signature will be confirmed asynchronously");

        // Log to Server Ledger
        try {
            // Dynamic Import to avoid build issues if needed, but import at top is better
            const { ServerLedger } = await import("@/lib/server-ledger");
            ServerLedger.log({
                type: "claim",
                description: `Claimed ${nftMint.slice(0, 8)}...`,
                actor: claimerAddress,
                target: nftMint,
                signature: signature,
                amount: 1
            });
        } catch (e) { console.error("Ledger Log Failed", e); }

        // Return immediately - don't wait for confirmation
        // The frontend will check the transaction status
        return NextResponse.json({
            success: true,
            nftMint,
            signature,
            message: "NFT claim initiated! Transaction confirming..."
        });

    } catch (error: any) {
        console.error("Error processing NFT claim:", error);
        return NextResponse.json(
            { error: error.message || "Failed to process claim" },
            { status: 500 }
        );
    }
}


export const runtime = 'edge';