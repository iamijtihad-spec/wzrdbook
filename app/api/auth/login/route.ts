import { NextRequest, NextResponse } from "next/server";
import { D1Client } from "@/lib/d1";
import crypto from "crypto";

export async function POST(req: NextRequest) {
    try {
        const { username, password } = await req.json();

        if (!username || !password) {
            return NextResponse.json({ success: false, error: "Missing required fields" }, { status: 400 });
        }

        const env = (process as any).env;
        let account: any;

        // 1. Hash Password
        const passwordHash = crypto.createHash('sha256').update(password).digest('hex');

        // 2. Query Account
        if (env?.DB) {
            // 2.1 D1 Mode
            account = await D1Client.first(
                "SELECT id, username, role FROM accounts WHERE username = ? AND password_hash = ?",
                [username, passwordHash],
                env
            );
        } else {
            // 2.2 Local Fallback
            const { StorageEngine } = await import("@/lib/server/storage");
            const accounts = await StorageEngine.read<any[]>("accounts", [], env);
            account = accounts.find(a => a.username === username && a.password_hash === passwordHash);
            if (account) {
                // Return same structure as D1 (id, username, role)
                account = { id: account.id, username: account.username, role: account.role || 'USER' };
            }
        }

        if (!account) {
            return NextResponse.json({ success: false, error: "Invalid username or password" }, { status: 401 });
        }

        // 3. Set Session
        const response = NextResponse.json({ success: true, account });
        response.cookies.set("wzrd_session", account.id.toString(), {
            httpOnly: true,
            secure: process.env.NODE_ENV === "production",
            maxAge: 60 * 60 * 24 * 7,
            path: "/"
        });

        return response;

    } catch (e: any) {
        console.error("Login Failed:", e);
        return NextResponse.json({ success: false, error: "Internal Server Error" }, { status: 500 });
    }
}
