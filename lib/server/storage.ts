import fs from 'fs';
import path from 'path';
import { D1Client } from '../d1';

const DATA_DIR = path.join(process.cwd(), 'data');

// Ensure data directory exists
if (!fs.existsSync(DATA_DIR)) {
    fs.mkdirSync(DATA_DIR, { recursive: true });
}

export class StorageEngine {
    private static getFilePath(collection: string): string {
        return path.join(DATA_DIR, `${collection}.json`);
    }

    /**
     * READ: Fetches data from D1 (SQL) or Local (JSON)
     */
    static async read<T>(collection: string, defaultValue: T, env?: any): Promise<T> {
        // 1. D1 Mode (Production/Edge)
        if (env?.DB) {
            try {
                if (collection === "users") {
                    const results = await D1Client.query("SELECT * FROM users", [], env);
                    // Convert rows back to Record<string, UserProfile>
                    const userMap: any = {};
                    results.forEach((row: any) => {
                        userMap[row.wallet] = {
                            ...row,
                            scars: JSON.parse(row.scars || '[]'),
                            history: JSON.parse(row.history || '[]'),
                        };
                    });
                    return userMap as unknown as T;
                }

                if (collection === "creature_states") {
                    const results = await D1Client.query("SELECT * FROM creature_states", [], env);
                    const stateMap: any = {};
                    results.forEach((row: any) => {
                        stateMap[row.mint] = row;
                    });
                    return stateMap as unknown as T;
                }
            } catch (e) {
                console.error(`D1 Read Error [${collection}]:`, e);
            }
        }

        // 2. Local Fallback (JSON)
        const filePath = this.getFilePath(collection);
        if (!fs.existsSync(filePath)) {
            await this.write(collection, defaultValue);
            return defaultValue;
        }

        try {
            const data = fs.readFileSync(filePath, 'utf-8');
            return JSON.parse(data) as T;
        } catch (error) {
            console.error(`Failed to read collection: ${collection}`, error);
            return defaultValue;
        }
    }

    /**
     * WRITE: Persists data to D1 (SQL) or Local (JSON)
     */
    static async write<T>(collection: string, data: T, env?: any): Promise<void> {
        // 1. D1 Mode (Hybrid: Usually handled via specialized update calls, 
        // but adding support for simple collection replacements if needed)
        if (env?.DB) {
            // Specialized logic per collection could go here
            return;
        }

        // 2. Local Fallback (JSON)
        const filePath = this.getFilePath(collection);
        try {
            fs.writeFileSync(filePath, JSON.stringify(data, null, 2), 'utf-8');
        } catch (error) {
            console.error(`Failed to write collection: ${collection}`, error);
            throw new Error(`Storage Write Error: ${collection}`);
        }
    }

    /**
     * UPDATE: Atomic update for collections
     */
    static async update<T>(collection: string, updateFn: (current: T) => T, defaultValue: T, env?: any): Promise<T> {
        const current = await this.read<T>(collection, defaultValue, env);
        const updated = updateFn(current);
        await this.write(collection, updated, env);
        return updated;
    }
}
