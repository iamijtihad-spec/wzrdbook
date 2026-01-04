
import { S3Client, PutObjectCommand } from "@aws-sdk/client-s3";
import chokidar from "chokidar";
import dotenv from "dotenv";
import fs from "fs";
import path from "path";
import mime from "mime-types";

// Load environment variables
dotenv.config({ path: ".env.local" });

const R2_ACCESS_KEY_ID = process.env.R2_ACCESS_KEY_ID;
const R2_SECRET_ACCESS_KEY = process.env.R2_SECRET_ACCESS_KEY;
const R2_BUCKET_NAME = process.env.R2_BUCKET_NAME;
const R2_ENDPOINT = process.env.R2_ENDPOINT;

if (!R2_ACCESS_KEY_ID || !R2_SECRET_ACCESS_KEY || !R2_BUCKET_NAME || !R2_ENDPOINT) {
    console.error("❌ Missing R2 Environment Variables in .env.local");
    process.exit(1);
}

// Initialize R2 Client
const s3Client = new S3Client({
    region: "auto",
    endpoint: R2_ENDPOINT,
    credentials: {
        accessKeyId: R2_ACCESS_KEY_ID,
        secretAccessKey: R2_SECRET_ACCESS_KEY,
    },
});

const DESKTOP_PORTAL_PATH = path.join(process.env.HOME || "", "Desktop", "GRITCOIN_Portal");

console.log(`🔮 GRITCOIN Portal Active`);
console.log(`📂 Watching: ${DESKTOP_PORTAL_PATH}`);
console.log(`☁️  Target Bucket: ${R2_BUCKET_NAME}`);

// Initialize Watcher
const watcher = chokidar.watch(DESKTOP_PORTAL_PATH, {
    ignored: [/(^|[\/\\])\../, "**/*.DS_Store"], // Ignore dotfiles
    persistent: true,
    ignoreInitial: true, // Don't upload existing files on startup for now, or true? User might want to drop files then run. Let's do false to sync?
    // Let's stick to true (ignore initial) to avoid mass re-uploading if not tracked, unless we track state.
    // For a simple portal, ignoring initial prevents accidental re-uploads of everything on restart.
    // User expects "copy files ... to upload". So copying *after* start is key.
});

watcher
    .on("add", async (filePath) => {
        const fileName = path.basename(filePath);
        const relativePath = path.relative(DESKTOP_PORTAL_PATH, filePath);

        // Ensure we are in a subfolder or root?
        console.log(`⚡️ Detected file: ${relativePath}`);

        try {
            const fileContent = fs.readFileSync(filePath);
            const contentType = mime.lookup(filePath) || "application/octet-stream";

            // Map local 'music' folder to remote 'tracks' folder to match existing R2 structure
            let uploadKey = relativePath;
            if (relativePath.startsWith('music/')) {
                uploadKey = relativePath.replace('music/', 'tracks/');
            }

            console.log(`🚀 Uploading ${uploadKey}...`);

            const command = new PutObjectCommand({
                Bucket: R2_BUCKET_NAME,
                Key: uploadKey,
                Body: fileContent,
                ContentType: contentType,
            });

            await s3Client.send(command);
            console.log(`✅ Upload Complete: ${uploadKey}`);

        } catch (error) {
            console.error(`❌ Upload Failed for ${fileName}:`, error);
        }
    })
    .on("error", (error) => console.error(`Watcher Error: ${error}`));
