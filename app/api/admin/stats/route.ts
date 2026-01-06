import { NextRequest, NextResponse } from "next/server";
import { Connection, PublicKey } from "@solana/web3.js";
import { TOKEN_MINTS, RPC_URL, TREASURY_VAULT } from "@/constants/tokens";
import { D1Client } from "@/lib/d1";
import { StorageEngine } from "@/lib/server/storage";

export async function GET() {
    try {
        const connection = new Connection(RPC_URL);
        const mintPubkey = new PublicKey(TOKEN_MINTS.GRIT);
        const treasuryPubkey = new PublicKey(TREASURY_VAULT);

        // 1. Fetch On-Chain Data
        const [supplyData, treasuryAccount] = await Promise.all([
            connection.getTokenSupply(mintPubkey),
            connection.getAccountInfo(treasuryPubkey)
        ]);

        const env = (process as any).env;
        let dbStats = {
            creatureCount: 0,
            totalScars: 0,
            avgLevel: 1,
            totalUsers: 0,
            totalHolders: 0,
            recentTransactions: [] as any[]
        };

        // 2. Fetch Database Metrics
        if (env?.DB) {
            const [counts, ledger] = await Promise.all([
                D1Client.query(`
                    SELECT 
                        (SELECT COUNT(*) FROM accounts) as user_count,
                        (SELECT COUNT(DISTINCT identifier) FROM linked_identities WHERE provider = 'wallet') as holder_count,
                        (SELECT COUNT(*) FROM creature_states) as creature_count,
                        (SELECT AVG(level) FROM creature_states) as avg_level,
                        (SELECT COUNT(*) FROM ledger WHERE type = 'burn') as scar_count
                `, [], env),
                D1Client.query(`
                    SELECT * FROM ledger ORDER BY timestamp DESC LIMIT 10
                `, [], env)
            ]);

            if (counts && counts[0]) {
                dbStats = {
                    totalUsers: counts[0].user_count || 0,
                    totalHolders: counts[0].holder_count || 0,
                    creatureCount: counts[0].creature_count || 0,
                    avgLevel: counts[0].avg_level || 1,
                    totalScars: counts[0].scar_count || 0,
                    recentTransactions: ledger || []
                };
            }
        } else {
            // Local Fallback
            const [accounts, identities, states, ledger] = await Promise.all([
                StorageEngine.read<any[]>("accounts", [], env),
                StorageEngine.read<any[]>("linked_identities", [], env),
                StorageEngine.read<any>("creature_states", {}, env),
                StorageEngine.read<any[]>("ledger", [], env)
            ]);

            const stateValues = Object.values(states);
            dbStats = {
                totalUsers: accounts.length,
                totalHolders: new Set(identities.filter(i => i.provider === 'wallet').map(i => i.identifier)).size,
                creatureCount: stateValues.length,
                avgLevel: stateValues.length > 0 ? stateValues.reduce((acc: number, s: any) => acc + (s.level || 0), 0) / stateValues.length : 1,
                totalScars: ledger.filter(l => l.type === 'burn').length,
                recentTransactions: ledger.slice(-10).reverse()
            };
        }

        const stats = {
            totalNFTs: dbStats.creatureCount,
            totalUsers: dbStats.totalUsers,
            totalHolders: dbStats.totalHolders,
            gritSupply: supplyData.value.uiAmount || 0,
            treasurySol: (treasuryAccount?.lamports || 0) / 1_000_000_000,
            avgCreatureLevel: Math.round(dbStats.avgLevel * 10) / 10,
            totalScars: dbStats.totalScars,
            recentTransactions: dbStats.recentTransactions,
        };

        return NextResponse.json({ success: true, ...stats });
    } catch (error) {
        console.error("Error fetching stats:", error);
        return NextResponse.json(
            { error: "Failed to fetch stats" },
            { status: 500 }
        );
    }
}


export const runtime = 'edge';