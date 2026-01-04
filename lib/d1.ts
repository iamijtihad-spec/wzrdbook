/**
 * Cloudflare D1 Client Wrapper
 * Handles database interactions for both Next.js Edge/Server and Local Dev
 */

export interface D1Result<T = any> {
    success: boolean;
    results?: T[];
    error?: string;
    meta?: any;
}

export class D1Client {
    private static getDB(env: any) {
        // In Cloudflare Environment, DB is bound to env.DB
        return env?.DB;
    }

    /**
     * Execute a raw SQL query (Select)
     */
    static async query<T = any>(sql: string, params: any[] = [], env?: any): Promise<T[]> {
        const db = this.getDB(env);
        if (!db) {
            // Silently fallback to StorageEngine if bound in the API route
            return [];
        }

        try {
            const { results } = await db.prepare(sql).bind(...params).all();
            return results as T[];
        } catch (e: any) {
            console.error("D1 Query Error:", e);
            throw e;
        }
    }

    /**
     * Execute a command (Insert, Update, Delete)
     */
    static async execute(sql: string, params: any[] = [], env?: any): Promise<boolean> {
        const db = this.getDB(env);
        if (!db) return false;

        try {
            const result = await db.prepare(sql).bind(...params).run();
            return result.success;
        } catch (e: any) {
            console.error("D1 Execution Error:", e);
            throw e;
        }
    }

    /**
     * Fetch a single row
     */
    static async first<T = any>(sql: string, params: any[] = [], env?: any): Promise<T | null> {
        const db = this.getDB(env);
        if (!db) return null;

        try {
            return await db.prepare(sql).bind(...params).first();
        } catch (e: any) {
            console.error("D1 First Error:", e);
            return null;
        }
    }
}
