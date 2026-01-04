import { NextRequest, NextResponse } from "next/server";
import { StorageEngine } from "@/lib/server/storage";
import { D1Client } from "@/lib/d1";

const COLLECTION = "users";

interface UserProfile {
    wallet: string;
    resonance: number;
    scars: any[];
    history: any[];
    lastActive: number;
}

type UserDatabase = Record<string, UserProfile>;

export async function GET(request: NextRequest) {
    const { searchParams } = new URL(request.url);
    const wallet = searchParams.get("wallet");
    const env = (process as any).env; // Access DB from global env in edge

    if (!wallet) {
        return NextResponse.json({ error: "Wallet required" }, { status: 400 });
    }

    try {
        // 1. D1 Mode
        if (env?.DB) {
            const profile = await D1Client.first(
                "SELECT * FROM users WHERE wallet = ?",
                [wallet],
                env
            );
            if (profile) {
                return NextResponse.json({
                    ...profile,
                    scars: JSON.parse(profile.scars || '[]'),
                    history: JSON.parse(profile.history || '[]')
                });
            }
        }

        // 2. Local/Fallback Mode
        const users = await StorageEngine.read<UserDatabase>(COLLECTION, {}, env);
        const profile = users[wallet] || {
            wallet,
            resonance: 0,
            scars: [],
            history: [],
            lastActive: Date.now()
        };

        return NextResponse.json(profile);
    } catch (error) {
        console.error("User GET Error:", error);
        return NextResponse.json({ error: "Failed to fetch user" }, { status: 500 });
    }
}

export async function POST(request: NextRequest) {
    try {
        const body = await request.json();
        const { wallet, resonance, scars, history } = body;
        const env = (process as any).env;

        if (!wallet) return NextResponse.json({ error: "Wallet required" }, { status: 400 });

        // 1. D1 Mode
        if (env?.DB) {
            const now = Date.now();
            await D1Client.execute(
                `INSERT INTO users (wallet, resonance, scars, history, last_active) 
                 VALUES (?, ?, ?, ?, ?)
                 ON CONFLICT(wallet) DO UPDATE SET 
                 resonance = excluded.resonance, 
                 scars = excluded.scars, 
                 history = excluded.history,
                 last_active = excluded.last_active`,
                [
                    wallet,
                    resonance || 0,
                    JSON.stringify(scars || []),
                    JSON.stringify(history || []),
                    now
                ],
                env
            );
            return NextResponse.json({ success: true });
        }

        // 2. Local Fallback
        await StorageEngine.update<UserDatabase>(COLLECTION, (users) => {
            const current = users[wallet] || { wallet, resonance: 0, scars: [], history: [] };
            return {
                ...users,
                [wallet]: {
                    ...current,
                    ...body,
                    lastActive: Date.now()
                }
            };
        }, {}, env);

        return NextResponse.json({ success: true });
    } catch (error) {
        console.error("User POST Error:", error);
        return NextResponse.json({ error: "Update failed" }, { status: 500 });
    }
}
