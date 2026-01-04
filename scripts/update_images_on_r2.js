const { S3Client, PutObjectCommand } = require("@aws-sdk/client-s3");
const fs = require("fs");
const path = require("path");
require("dotenv").config({ path: ".env.local" });

const R2_BUCKET_NAME = process.env.R2_BUCKET_NAME || "wzrdclvb";
const R2_PUBLIC_URL = "https://pub-1aa7bb22d4509ba4b29cfc9418424695.r2.dev";

const s3Client = new S3Client({
    region: "auto",
    endpoint: process.env.R2_ENDPOINT,
    credentials: {
        accessKeyId: process.env.R2_ACCESS_KEY_ID,
        secretAccessKey: process.env.R2_SECRET_ACCESS_KEY,
    },
});

async function uploadToR2(filePath, key) {
    console.log(`📤 Uploading ${key} to R2...`);
    const fileContent = fs.readFileSync(filePath);
    await s3Client.send(new PutObjectCommand({
        Bucket: R2_BUCKET_NAME,
        Key: key,
        Body: fileContent,
        ContentType: "image/png",
    }));
    console.log(`✅ Uploaded: ${R2_PUBLIC_URL}/${key}`);
}

async function main() {
    // List of files to update
    const files = [
        "crush_epic.png",
        "crush_legendary.png"
    ];

    for (const file of files) {
        const localPath = path.join(__dirname, "../public/images", file);
        if (fs.existsSync(localPath)) {
            await uploadToR2(localPath, `images/${file}`);
        } else {
            console.error(`❌ File not found: ${localPath}`);
        }
    }
}

main().catch(console.error);
