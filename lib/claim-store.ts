// import fs from 'fs';
// import path from 'path';

// const CLAIMS_FILE = path.join(process.cwd(), 'data', 'claims.json');

// Ensure data directory exists
// if (!fs.existsSync(path.join(process.cwd(), 'data'))) {
//     fs.mkdirSync(path.join(process.cwd(), 'data'));
// }

interface ClaimRecord {
    wallet: string;
    claimId: string;
    timestamp: number;
}

export function getClaims(wallet: string): ClaimRecord[] {
    // In Edge Runtime, local file persistence is not supported.
    // For now, return empty or implement D1 lookups here if context allows.
    console.warn("getClaims called in Edge Runtime - Persistance Disabled");
    return [];
}

export function addClaim(wallet: string, claimId: string): boolean {
    // In Edge Runtime, local file persistence is not supported.
    console.warn("addClaim called in Edge Runtime - Persistence Disabled");
    return true; // Mock success
}
