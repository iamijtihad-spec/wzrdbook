import { NextRequest, NextResponse } from "next/server";
import { Connection, PublicKey, Transaction, clusterApiUrl, Keypair } from "@solana/web3.js";
import { getAssociatedTokenAddress, createAssociatedTokenAccountInstruction, createTransferInstruction, getMint } from "@solana/spl-token";


const GRIT_MINT = "CS8ZQMdJ5t5hNuM51LXJBU4zBysZWAkFj9oJ6MwtnHsS";

const NFT_PRICES: Record<string, number> = {
    "De2VCg4QtNni1X4bX7PnWzSiYLF3MxPGJZ4p8hMKN95P": 100,   // ACTUALLY ACTUALLY
    "FvhqpsDH3Q5Uau73z4c6676ghHi4hUmFLSKNDMYxVES9": 100,   // CRUSH
    "CmfRoqvd5VuwccHx2A1NyzVvvoJXjhuUmPEkBa6P9bMX": 500,   // SEPTA
    "3YxNZE8nmpSjCDLf4xXFvf5S1kGepaNBRDyHVsm1w7wC": 500,   // TV
    "Dq4hsV7QSjfxCnkkn5yguTNnyyzEeECk5XYbQ74apUjr": 1000,  // VILLIAN STRUT
    "CJeHsQnGBcXG9HCZy5KsbteLQ213ci8EWFZcFbGS6PYz": 1000   // WZRD
};

export async function POST(request: NextRequest) {
    try {
        const body = await request.json();
        const { buyerAddress, nftMint, signature } = body;

        if (!buyerAddress || !nftMint || !signature) {
            return NextResponse.json(
                { error: "Missing required fields" },
                { status: 400 }
            );
        }

        // Validate addresses
        const buyerPubkey = new PublicKey(buyerAddress);
        const nftMintPubkey = new PublicKey(nftMint);
        const gritMintPubkey = new PublicKey(GRIT_MINT);

        // Get price
        const price = NFT_PRICES[nftMint];
        if (!price) {
            return NextResponse.json(
                { error: "Invalid NFT mint address" },
                { status: 400 }
            );
        }

        // Connect to Solana
        const connection = new Connection(clusterApiUrl("devnet"));

        // Load treasury wallet
        // Load treasury wallet
        // const treasuryPath = path.join(process.cwd(), "scripts", "dev-wallet.json");
        let treasury: Keypair;

        if (process.env.TREASURY_SECRET) {
            const secret = JSON.parse(process.env.TREASURY_SECRET);
            treasury = Keypair.fromSecretKey(Uint8Array.from(secret));
        } else {
            return NextResponse.json(
                { error: "Treasury wallet not configured in Env" },
                { status: 500 }
            );
        }

        // Verify payment signature
        const tx = await connection.getTransaction(signature, {
            maxSupportedTransactionVersion: 0
        });

        if (!tx || !tx.meta || tx.meta.err) {
            return NextResponse.json(
                { error: "Invalid or failed payment transaction" },
                { status: 400 }
            );
        }

        // Get GRIT mint info for decimals
        const mintInfo = await getMint(connection, gritMintPubkey);
        const expectedAmount = price * Math.pow(10, mintInfo.decimals);

        // Verify the payment went to treasury
        const treasuryATA = await getAssociatedTokenAddress(gritMintPubkey, treasury.publicKey);

        // Check post-balances to verify payment
        let paymentVerified = false;
        if (tx.meta.postTokenBalances && tx.meta.preTokenBalances) {
            for (const postBalance of tx.meta.postTokenBalances) {
                if (postBalance.owner === treasury.publicKey.toBase58()) {
                    const preBalance = tx.meta.preTokenBalances.find(
                        (b) => b.accountIndex === postBalance.accountIndex
                    );
                    if (preBalance) {
                        const diff = Number(postBalance.uiTokenAmount.amount) - Number(preBalance.uiTokenAmount.amount);
                        if (diff >= expectedAmount) {
                            paymentVerified = true;
                            break;
                        }
                    }
                }
            }
        }

        if (!paymentVerified) {
            return NextResponse.json(
                { error: "Payment verification failed" },
                { status: 400 }
            );
        }

        // Transfer NFT to buyer
        const transaction = new Transaction();

        // Get treasury NFT token account
        const treasuryNFTAccount = await getAssociatedTokenAddress(nftMintPubkey, treasury.publicKey);

        // Get or create buyer NFT token account
        const buyerNFTAccount = await getAssociatedTokenAddress(nftMintPubkey, buyerPubkey);

        const accountInfo = await connection.getAccountInfo(buyerNFTAccount);
        if (!accountInfo) {
            transaction.add(
                createAssociatedTokenAccountInstruction(
                    treasury.publicKey,
                    buyerNFTAccount,
                    buyerPubkey,
                    nftMintPubkey
                )
            );
        }

        // Add NFT transfer instruction
        transaction.add(
            createTransferInstruction(
                treasuryNFTAccount,
                buyerNFTAccount,
                treasury.publicKey,
                1 // NFTs have amount of 1
            )
        );

        // Send transaction
        const transferSignature = await connection.sendTransaction(transaction, [treasury]);
        await connection.confirmTransaction(transferSignature, "confirmed");

        return NextResponse.json({
            success: true,
            nftMint,
            transferSignature,
            message: "NFT purchased successfully!"
        });

    } catch (error: any) {
        console.error("Error processing NFT purchase:", error);
        return NextResponse.json(
            { error: error.message || "Failed to process purchase" },
            { status: 500 }
        );
    }
}


export const runtime = 'edge';