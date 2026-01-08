
// import fs from "fs";
// import path from "path";
import { D1Client } from "./d1";

// const LEDGER_FILE = path.join(process.cwd(), "data", "ledger.json");

// Define Activity Type
export interface LedgerEntry {
    id: string;
    timestamp: number;
    type: "transfer" | "claim" | "mint" | "bounty" | "system";
    description: string;
    actor: string; // Wallet or "SYSTEM"
    target?: string; // Recipient or NFT Mint
    amount?: number;
    signature?: string;
    meta?: any;
}

// Ensure data directory exists
// if (!fs.existsSync(path.dirname(LEDGER_FILE))) {
//     fs.mkdirSync(path.dirname(LEDGER_FILE), { recursive: true });
// }

export const ServerLedger = {
    /**
     * Append a new entry to the ledger
     */
    log: async (entry: Omit<LedgerEntry, "id" | "timestamp">, env?: any) => {
        const id = Math.random().toString(36).substring(7);
        const timestamp = Date.now();

        // 1. D1 Mode
        if (env?.DB) {
            try {
                await D1Client.execute(
                    `INSERT INTO ledger (id, timestamp, type, description, actor, target, amount, signature, meta)
                     VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`,
                    [
                        id,
                        timestamp,
                        entry.type,
                        entry.description,
                        entry.actor,
                        entry.target || null,
                        entry.amount || null,
                        entry.signature || null,
                        JSON.stringify(entry.meta || {})
                    ],
                    env
                );
                return { id, timestamp, ...entry };
            } catch (e) {
                console.error("D1 Ledger Log Failed:", e);
            }
        }

        // 2. Local Fallback
        // try {
        //     const currentChain = ServerLedger.readSync();
        //     const newEntry: LedgerEntry = { id, timestamp, ...entry };
        //     currentChain.unshift(newEntry);
        //     const trimmed = currentChain.slice(0, 1000);
        //     fs.writeFileSync(LEDGER_FILE, JSON.stringify(trimmed, null, 2));
        //     return newEntry;
        // } catch (e) {
        //     console.error("Ledger Write Error:", e);
        //     return null;
        // }
        console.warn("Ledger log write disabled in Edge Runtime");
        return null;
    },

    /**
     * Read the full ledger (Async for D1 support)
     */
    read: async (env?: any): Promise<LedgerEntry[]> => {
        // 1. D1 Mode
        if (env?.DB) {
            try {
                const results = await D1Client.query<any>("SELECT * FROM ledger ORDER BY timestamp DESC LIMIT 1000", [], env);
                return results.map(row => ({
                    ...row,
                    meta: JSON.parse(row.meta || '{}')
                }));
            } catch (e) {
                console.error("D1 Ledger Read Failed:", e);
            }
        }

        // 2. Local Fallback
        return ServerLedger.readSync();
    },

    /**
     * Legacy Sync Read (For non-async contexts or local files)
     */
    readSync: (): LedgerEntry[] => {
        // if (!fs.existsSync(LEDGER_FILE)) return [];
        // try {
        //     const data = fs.readFileSync(LEDGER_FILE, "utf-8");
        //     return JSON.parse(data);
        // } catch (e) {
        //     console.error("Ledger Read Error:", e);
        //     return [];
        // }
        console.warn("Ledger readSync disabled in Edge Runtime");
        return [];
    },

    /**
     * Get recent N entries
     */
    getRecent: async (limit: number = 50, env?: any): Promise<LedgerEntry[]> => {
        const full = await ServerLedger.read(env);
        return full.slice(0, limit);
    }
};
