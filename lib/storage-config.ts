import { S3Client } from '@aws-sdk/client-s3';

// WZRDCLVB (Radio / Core)
const WZRD_CONFIG = {
    accountId: process.env.R2_ACCOUNT_ID,
    accessKey: process.env.R2_ACCESS_KEY_ID,
    secretKey: process.env.R2_SECRET_ACCESS_KEY,
    bucket: process.env.R2_BUCKET_NAME || "wzrdclvb",
    publicUrl: process.env.R2_PUBLIC_URL
};

// SATURN (Rings / Dashboard)
const SATURN_CONFIG = {
    accountId: process.env.SATURN_R2_ACCOUNT_ID,
    accessKey: process.env.SATURN_R2_ACCESS_KEY_ID,
    secretKey: process.env.SATURN_R2_SECRET_ACCESS_KEY,
    bucket: process.env.SATURN_R2_BUCKET_NAME || "saturn-dashboard-storage",
    publicUrl: process.env.SATURN_R2_PUBLIC_URL
};

export const getR2Client = (type: 'wzrd' | 'saturn' = 'saturn') => {
    const config = type === 'wzrd' ? WZRD_CONFIG : SATURN_CONFIG;

    if (!config.accountId || !config.accessKey || !config.secretKey) {
        throw new Error(`R2 Configuration missing for ${type}`);
    }

    const client = new S3Client({
        region: 'auto',
        endpoint: `https://${config.accountId}.r2.cloudflarestorage.com`,
        credentials: {
            accessKeyId: config.accessKey,
            secretAccessKey: config.secretKey,
        },
    });

    return { client, bucket: config.bucket, publicUrl: config.publicUrl };
};
