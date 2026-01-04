
import { S3Client, PutObjectCommand, ListBucketsCommand } from "@aws-sdk/client-s3";
import fs from "fs";
import path from "path";
import dotenv from "dotenv";

// Load environment variables
dotenv.config({ path: ".env.local" });

const TARGET_DIR_NAME = "CRUSH TRACKOUT";
const MUSIC_DIR = path.join(process.cwd(), "public", "music", TARGET_DIR_NAME);
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

async function checkConnection() {
    console.log("R2 Config Check:");
    console.log("- Endpoint:", R2_CONFIG.endpoint || "MISSING");
    try {
        console.log("Checking connection...");
        const { Buckets } = await s3Client.send(new ListBucketsCommand({}));
        console.log("✅ Connected! Buckets:", Buckets?.map(b => b.Name).join(", "));
        return true;
    } catch (error: any) {
        console.error("❌ Connection failed:", error.message);
        return false;
    }
}

async function uploadFile(fileName: string) {
    const filePath = path.join(MUSIC_DIR, fileName);
    const fileContent = fs.readFileSync(filePath);

    // Mirror the public path: music/CRUSH TRACKOUT/filename
    // Note: 'music/' prefix to keep it organized in bucket similar to public folder
    const key = `music/${TARGET_DIR_NAME}/${fileName}`;

    console.log(`Uploading ${fileName} to ${key}...`);
    try {
        const command = new PutObjectCommand({
            Bucket: BUCKET_NAME,
            Key: key,
            Body: fileContent,
            ContentType: "audio/wav",
        });

        await s3Client.send(command);
        console.log(`✅ Uploaded ${fileName}`);
    } catch (error) {
        console.error(`❌ Failed for ${fileName}:`, error);
    }
}

async function main() {
    console.log(`Target Directory: ${MUSIC_DIR}`);
    if (!await checkConnection()) process.exit(1);

    if (!fs.existsSync(MUSIC_DIR)) {
        console.error(`Directory not found: ${MUSIC_DIR}`);
        process.exit(1);
    }

    const files = fs.readdirSync(MUSIC_DIR);

    for (const file of files) {
        if ((file.endsWith(".wav") || file.endsWith(".mp3")) && !file.startsWith("._")) {
            await uploadFile(file);
        }
    }
    console.log("Upload sequence complete.");
}

main().catch(console.error);
