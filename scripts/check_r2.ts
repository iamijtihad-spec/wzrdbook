import { S3Client, ListObjectsV2Command } from "@aws-sdk/client-s3";
import * as dotenv from "dotenv";
import path from "path";

dotenv.config({ path: path.resolve(__dirname, "../.env.local") });

async function listBucket() {
    const client = new S3Client({
        region: "auto",
        endpoint: process.env.R2_ENDPOINT,
        credentials: {
            accessKeyId: process.env.R2_ACCESS_KEY_ID || "",
            secretAccessKey: process.env.R2_SECRET_ACCESS_KEY || "",
        },
    });

    console.log("Listing bucket:", process.env.R2_BUCKET_NAME);
    const cmd = new ListObjectsV2Command({ Bucket: process.env.R2_BUCKET_NAME });
    try {
        const res = await client.send(cmd);
        console.log("Files found:");
        res.Contents?.forEach(c => console.log("-", c.Key));
    } catch (e) {
        console.error("Error:", e);
    }
}

listBucket();
