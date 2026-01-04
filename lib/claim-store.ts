import fs from 'fs';
import path from 'path';

const CLAIMS_FILE = path.join(process.cwd(), 'data', 'claims.json');

// Ensure data directory exists
if (!fs.existsSync(path.join(process.cwd(), 'data'))) {
    fs.mkdirSync(path.join(process.cwd(), 'data'));
}

interface ClaimRecord {
    wallet: string;
    claimId: string;
    timestamp: number;
}

export function getClaims(wallet: string): ClaimRecord[] {
    try {
        if (!fs.existsSync(CLAIMS_FILE)) return [];
        const data = fs.readFileSync(CLAIMS_FILE, 'utf-8');
        const claims: ClaimRecord[] = JSON.parse(data);
        return claims.filter(c => c.wallet === wallet);
    } catch (error) {
        console.error("Error reading claims:", error);
        return [];
    }
}

export function addClaim(wallet: string, claimId: string): boolean {
    try {
        let claims: ClaimRecord[] = [];
        if (fs.existsSync(CLAIMS_FILE)) {
            const data = fs.readFileSync(CLAIMS_FILE, 'utf-8');
            claims = JSON.parse(data);
        }

        // Check if already claimed
        if (claims.some(c => c.wallet === wallet && c.claimId === claimId)) {
            return false;
        }

        claims.push({
            wallet,
            claimId,
            timestamp: Date.now()
        });

        fs.writeFileSync(CLAIMS_FILE, JSON.stringify(claims, null, 2));
        return true;
    } catch (error) {
        console.error("Error saving claim:", error);
        return false;
    }
}
