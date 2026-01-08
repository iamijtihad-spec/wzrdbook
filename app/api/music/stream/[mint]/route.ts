import { NextRequest, NextResponse } from "next/server";
import { S3Client, GetObjectCommand } from "@aws-sdk/client-s3";
import { getTrackByMint } from "@/lib/nft-config";
import { scanLocalAudio } from "@/lib/server/audio-scanner";

// Initialize R2 Client
const R2_CONFIG = {
    region: "auto",
    endpoint: process.env.R2_ENDPOINT || "",
    credentials: {
        accessKeyId: process.env.R2_ACCESS_KEY_ID || "",
        secretAccessKey: process.env.R2_SECRET_ACCESS_KEY || "",
    },
    forcePathStyle: true,
};

// Bucket name should be in env, or fallback to known bucket
const BUCKET_NAME = process.env.R2_BUCKET_NAME || "wzrdclvb";

// Helper to stream local file to web stream
function nodeStreamToIterator(stream: fs.ReadStream) {
    return new ReadableStream({
        start(controller) {
            stream.on('data', (chunk) => controller.enqueue(chunk));
            stream.on('end', () => controller.close());
            stream.on('error', (err) => controller.error(err));
        },
        cancel() {
            stream.destroy();
        },
    });
}

export async function GET(
    request: NextRequest,
    { params }: { params: Promise<{ mint: string }> }
) {
    try {
        const { mint } = await params;
        const { searchParams } = new URL(request.url);
        const wallet = searchParams.get("wallet");

        // 1. Validation
        if (!wallet) {
            return new NextResponse("Wallet address required", { status: 401 });
        }

        // --- LOCAL TRACK HANDLING ---
        // Edge Runtime cannot stream local files from disk.
        // We only support R2 or externally hosted URLs in this mode.
        if (mint.startsWith("local-")) {
            return new NextResponse("Local file streaming not supported in Edge Runtime. Please upload to R2.", { status: 400 });
        }
        // -----------------------------

        const track = getTrackByMint(mint);
        if (!track) {
            return new NextResponse("Track not found in config", { status: 404 });
        }

        // 2. Verify Access (Based on Rarity/Ring)
        const isPublic = track.rarity === "Common";

        if (!isPublic) {
            const { verifyGritHolder } = await import("@/lib/verify-ownership");
            const hasAccess = await verifyGritHolder(wallet);

            if (!hasAccess) {
                console.warn(`Denied access: Wallet ${wallet} does not hold GRIT for restricted track ${track.title}`);
                return new NextResponse("Access Denied: You must hold GRIT to stream this restricted track.", { status: 403 });
            }
        } else {
            // console.log(`Allowing public access for Common track: ${track.title}`);
        }

        // 3. Stream from R2
        const s3Client = new S3Client(R2_CONFIG);
        const command = new GetObjectCommand({
            Bucket: BUCKET_NAME,
            Key: `tracks/${track.audioFile}`,
        });

        try {
            const response = await s3Client.send(command);

            if (!response.Body) {
                throw new Error("Empty body from R2");
            }

            // Convert Node Stream to Web Stream for Next.js
            const stream = response.Body.transformToWebStream();

            return new NextResponse(stream, {
                headers: {
                    "Content-Type": response.ContentType || "audio/wav",
                    "Content-Length": response.ContentLength?.toString() || "",
                    "Cache-Control": "private, max-age=3600",
                    "Accept-Ranges": "bytes",
                },
            });
        } catch (s3Error) {
            console.error("R2 Error:", s3Error);
            return new NextResponse("Error fetching audio file", { status: 502 });
        }

    } catch (error) {
        console.error("Streaming API Error:", error);
        return new NextResponse("Internal Server Error", { status: 500 });
    }
}


export const runtime = 'edge';