
import { S3Client, PutObjectCommand } from "@aws-sdk/client-s3";
import fs from "fs";
import path from "path";
import dotenv from "dotenv";

// Load environment variables
dotenv.config({ path: ".env.local" });
// Fallback if .env.local doesn't allow overriding or isn't picked up appropriately (though standard dotenv usually works)

const MUSIC_DIR = path.join(process.cwd(), "public", "music");
const BUCKET_NAME = process.env.R2_BUCKET_NAME || "wzrdclvb";

const sanitize = (val?: string) => val ? val.replace(/"/g, '').trim() : "";

const R2_CONFIG = {
    region: "us-east-1",
    endpoint: sanitize(process.env.R2_ENDPOINT),
    credentials: {
        accessKeyId: sanitize(process.env.R2_ACCESS_KEY_ID),
        secretAccessKey: sanitize(process.env.R2_SECRET_ACCESS_KEY),
    },
    forcePathStyle: true,
    requestChecksumCalculation: "WHEN_REQUIRED" as const,
    responseChecksumValidation: "WHEN_REQUIRED" as const,
};

const s3Client = new S3Client(R2_CONFIG);

import { ListBucketsCommand } from "@aws-sdk/client-s3";

async function checkConnection() {
    console.log("R2 Config Check:");
    console.log("- Region:", R2_CONFIG.region);
    console.log("- Endpoint:", R2_CONFIG.endpoint || "MISSING");
    console.log("- Access Key Length:", R2_CONFIG.credentials.accessKeyId.length);
    console.log("- Secret Key Length:", R2_CONFIG.credentials.secretAccessKey.length);

    try {
        console.log("Checking connection...");
        const { Buckets } = await s3Client.send(new ListBucketsCommand({}));
        console.log("✅ Connected! Buckets:", Buckets?.map(b => b.Name).join(", "));
        return true;
    } catch (error: any) {
        console.error("❌ Connection failed detailed:", {
            name: error.name,
            httpStatusCode: error.$metadata?.httpStatusCode,
            requestId: error.$metadata?.requestId,
            message: error.message
        });
        return false;
    }
}

async function uploadFile(fileName: string) {
    const filePath = path.join(MUSIC_DIR, fileName);
    const fileContent = fs.readFileSync(filePath);

    // Key prefix 'tracks/' matches the API route logic
    const key = `tracks/${fileName}`;
    const MAX_RETRIES = 3;

    for (let attempt = 1; attempt <= MAX_RETRIES; attempt++) {
        console.log(`Uploading ${fileName} to ${key} (Attempt ${attempt}/${MAX_RETRIES})...`);
        try {
            const command = new PutObjectCommand({
                Bucket: BUCKET_NAME,
                Key: key,
                Body: fileContent,
                ContentType: "audio/wav",
            });

            await s3Client.send(command);
            console.log(`✅ Uploaded ${fileName}`);
            return; // Success
        } catch (error) {
            console.error(`⚠️ Attempt ${attempt} failed for ${fileName}:`, error);
            if (attempt === MAX_RETRIES) {
                console.error(`❌ Failed to upload ${fileName} after ${MAX_RETRIES} attempts.`);
            } else {
                // Exponential backoff
                const delay = Math.pow(2, attempt) * 1000;
                console.log(`Waiting ${delay}ms before retry...`);
                await new Promise(r => setTimeout(r, delay));
            }
        }
    }
}

async function main() {
    console.log("Starting upload to R2...");
    console.log("Endpoint:", process.env.R2_ENDPOINT ? "HIDDEN" : "MISSING");
    console.log("Access Key:", process.env.R2_ACCESS_KEY_ID ? "HIDDEN" : "MISSING");
    console.log("Bucket:", BUCKET_NAME);

    if (!await checkConnection()) {
        console.error("Aborting upload due to connection failure.");
        process.exit(1);
    }

    const files = fs.readdirSync(MUSIC_DIR);

    for (const file of files) {
        if (file.endsWith(".wav") && !file.startsWith("._")) {
            await uploadFile(file);
        }
    }

    console.log("Upload sequence complete.");
}

main().catch(console.error);
