import { NextRequest, NextResponse } from "next/server";
import { D1Client } from "@/lib/d1";
import crypto from "crypto";

export async function POST(req: NextRequest) {
    try {
        const { username, password, ritualKey } = await req.json();

        // 1. Verify Ritual Key (Hardcoded for this initialization phase)
        const MASTER_RITUAL_KEY = "WZRD_INITIATE_PRIME_001";
        if (ritualKey !== MASTER_RITUAL_KEY) {
            return NextResponse.json({ success: false, error: "Access Denied" }, { status: 403 });
        }

        if (!username || !password) {
            return NextResponse.json({ success: false, error: "Missing required fields" }, { status: 400 });
        }

        const env = (process as any).env;
        let accountId: number;

        // 2. Hash Password
        const passwordHash = crypto.createHash('sha256').update(password).digest('hex');

        // 3. Create Admin Account
        if (env?.DB) {
            // 3.1 D1 Mode
            const accountResult = await D1Client.query(
                "INSERT INTO accounts (username, password_hash, role, created_at) VALUES (?, ?, ?, ?) RETURNING id",
                [username, passwordHash, 'ADMIN', Date.now()],
                env
            );

            if (!accountResult || accountResult.length === 0) {
                return NextResponse.json({ success: false, error: "Failed to create admin account" }, { status: 500 });
            }

            accountId = accountResult[0].id;

            // 4. Initialize User Profile for Admin
            await D1Client.execute(
                "INSERT INTO users (account_id, resonance, current_domain, last_active) VALUES (?, ?, ?, ?)",
                [accountId, 999, 'SOVEREIGN', Date.now()], // Admins start with high resonance
                env
            );
        } else {
            // 3.2 Local Fallback Mode
            const { StorageEngine } = await import("@/lib/server/storage");

            const accounts = await StorageEngine.read<any[]>("accounts", [], env);
            if (accounts.some(a => a.username === username)) {
                return NextResponse.json({ success: false, error: "Username already exists" }, { status: 409 });
            }

            accountId = Date.now();
            accounts.push({ id: accountId, username, password_hash: passwordHash, role: 'ADMIN', created_at: Date.now() });
            await StorageEngine.write("accounts", accounts, env);

            const users = await StorageEngine.read<any>("users_mock", {}, env);
            users[accountId] = { account_id: accountId, resonance: 999, current_domain: 'SOVEREIGN', last_active: Date.now() };
            await StorageEngine.write("users_mock", users, env);
        }

        return NextResponse.json({ success: true, accountId, role: 'ADMIN' });

    } catch (e: any) {
        console.error("Admin Registration Failed:", e);
        return NextResponse.json({ success: false, error: "Internal Server Error" }, { status: 500 });
    }
}
