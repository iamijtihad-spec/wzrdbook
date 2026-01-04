import { NextRequest, NextResponse } from "next/server";
import { Connection, PublicKey } from "@solana/web3.js";
import { getAssociatedTokenAddress, getAccount } from "@solana/spl-token";
import { S3Client, GetObjectCommand } from "@aws-sdk/client-s3";
import { getSignedUrl } from "@aws-sdk/s3-request-presigner";

const GRIT_MINT = "CS8ZQMdJ5t5hNuM51LXJBU4zBysZWAkFj9oJ6MwtnHsS";
const RPC_ENDPOINT = "https://api.devnet.solana.com";

// Initialize R2 client (S3-compatible)
const r2Client = new S3Client({
    region: "us-east-1", // R2 requires us-east-1
    endpoint: process.env.R2_ENDPOINT, // e.g., https://[account-id].r2.cloudflarestorage.com
    credentials: {
        accessKeyId: process.env.R2_ACCESS_KEY_ID!,
        secretAccessKey: process.env.R2_SECRET_ACCESS_KEY!,
    },
    forcePathStyle: true, // Required for R2
});

export async function POST(request: NextRequest) {
    try {
        const body = await request.json();
        const { walletAddress, trackKey } = body;

        if (!walletAddress || !trackKey) {
            return NextResponse.json(
                { error: "Missing walletAddress or trackKey" },
                { status: 400 }
            );
        }

        // Verify wallet holds GRIT
        const connection = new Connection(RPC_ENDPOINT, "confirmed");
        const walletPubkey = new PublicKey(walletAddress);
        const mintPubkey = new PublicKey(GRIT_MINT);

        try {
            const ata = await getAssociatedTokenAddress(mintPubkey, walletPubkey);
            const tokenAccount = await getAccount(connection, ata);

            if (Number(tokenAccount.amount) === 0) {
                return NextResponse.json(
                    { error: "You must hold GRIT to access this content" },
                    { status: 403 }
                );
            }
        } catch {
            return NextResponse.json(
                { error: "You must hold GRIT to access this content" },
                { status: 403 }
            );
        }

        // Generate signed URL from R2
        const command = new GetObjectCommand({
            Bucket: process.env.R2_BUCKET_NAME!,
            Key: trackKey, // e.g., "tracks/song1.mp3"
        });

        const signedUrl = await getSignedUrl(r2Client, command, {
            expiresIn: 300, // 5 minutes
        });

        return NextResponse.json({ url: signedUrl });
    } catch (error) {
        console.error("Error generating signed URL:", error);
        return NextResponse.json(
            { error: "Failed to generate music URL" },
            { status: 500 }
        );
    }
}
