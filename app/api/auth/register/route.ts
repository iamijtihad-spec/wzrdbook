import { NextRequest, NextResponse } from "next/server";
import { D1Client } from "@/lib/d1";
import crypto from "crypto";

export async function POST(req: NextRequest) {
    try {
        const { username, password, wallet, discordId } = await req.json();

        if (!username || !password) {
            return NextResponse.json({ success: false, error: "Missing required fields" }, { status: 400 });
        }

        const env = (process as any).env;
        let accountId: number;

        // 1. Hash Password (Simple SHA-256 for demo, in prod use Argon2/bcrypt)
        const passwordHash = crypto.createHash('sha256').update(password).digest('hex');

        // 2. Transact Account Creation
        if (env?.DB) {
            // 2.1 Create Account
            const accountResult = await D1Client.query(
                "INSERT INTO accounts (username, password_hash, created_at) VALUES (?, ?, ?) RETURNING id",
                [username, passwordHash, Date.now()],
                env
            );

            if (!accountResult || accountResult.length === 0) {
                return NextResponse.json({ success: false, error: "Failed to create account" }, { status: 500 });
            }

            accountId = accountResult[0].id;

            // 2.2 Link Identities
            if (wallet) {
                await D1Client.execute(
                    "INSERT INTO linked_identities (account_id, provider, identifier) VALUES (?, ?, ?)",
                    [accountId, 'wallet', wallet],
                    env
                );
            }

            if (discordId) {
                await D1Client.execute(
                    "INSERT INTO linked_identities (account_id, provider, identifier) VALUES (?, ?, ?)",
                    [accountId, 'discord', discordId],
                    env
                );
            }

            // 2.3 Initialize User Progress
            await D1Client.execute(
                "INSERT INTO users (account_id, resonance, current_domain, last_active) VALUES (?, ?, ?, ?)",
                [accountId, 0, 'SOVEREIGN', Date.now()],
                env
            );
        } else {
            // 2.4 Local Fallback
            const { StorageEngine } = await import("@/lib/server/storage");

            // Manage Accounts
            const accounts = await StorageEngine.read<any[]>("accounts", [], env);
            if (accounts.some(a => a.username === username)) {
                return NextResponse.json({ success: false, error: "Username already exists" }, { status: 409 });
            }

            accountId = Date.now();
            accounts.push({ id: accountId, username, password_hash: passwordHash, created_at: Date.now() });
            await StorageEngine.write("accounts", accounts, env);

            // Manage Linked Identities
            const identities = await StorageEngine.read<any[]>("linked_identities", [], env);
            if (wallet) identities.push({ account_id: accountId, provider: 'wallet', identifier: wallet });
            if (discordId) identities.push({ account_id: accountId, provider: 'discord', identifier: discordId });
            await StorageEngine.write("linked_identities", identities, env);

            // Manage User Progress
            const users = await StorageEngine.read<any>("users_mock", {}, env);
            users[accountId] = { account_id: accountId, resonance: 0, current_domain: 'SOVEREIGN', last_active: Date.now() };
            await StorageEngine.write("users_mock", users, env);
        }

        // 3. Set Session (Mock session cookie)
        const response = NextResponse.json({ success: true, accountId, username });
        response.cookies.set("wzrd_session", accountId.toString(), {
            httpOnly: true,
            secure: process.env.NODE_ENV === "production",
            maxAge: 60 * 60 * 24 * 7, // 1 week
            path: "/"
        });

        return response;

    } catch (e: any) {
        console.error("Registration Failed:", e);
        if (e.message?.includes("UNIQUE constraint failed")) {
            return NextResponse.json({ success: false, error: "Username or Identity already exists" }, { status: 409 });
        }
        return NextResponse.json({ success: false, error: "Internal Server Error" }, { status: 500 });
    }
}


export const runtime = 'edge';