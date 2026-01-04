
import { S3Client, ListObjectsCommand } from "@aws-sdk/client-s3";
import dotenv from "dotenv";

dotenv.config({ path: ".env.local" });

const R2_CONFIG = {
    region: "auto",
    endpoint: process.env.R2_ENDPOINT || "",
    credentials: {
        accessKeyId: process.env.R2_ACCESS_KEY_ID || "",
        secretAccessKey: process.env.R2_SECRET_ACCESS_KEY || "",
    },
};

const BUCKET_NAME = process.env.R2_BUCKET_NAME || "wzrdclvb";

async function listKeys() {
    console.log(`🔍 Listing keys in bucket: ${BUCKET_NAME}`);
    const client = new S3Client(R2_CONFIG);
    try {
        const command = new ListObjectsCommand({ Bucket: BUCKET_NAME });
        const result = await client.send(command);
        if (!result.Contents || result.Contents.length === 0) {
            console.log("⚠️  Bucket is empty.");
        } else {
            console.log("✅ Found files:");
            result.Contents.forEach(item => {
                console.log(` - ${item.Key} (${item.Size} bytes)`);
            });
        }
    } catch (e) {
        console.error("❌ Error listing objects:", e);
    }
}

listKeys();
