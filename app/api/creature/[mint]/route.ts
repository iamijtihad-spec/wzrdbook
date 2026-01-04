import { NextRequest, NextResponse } from "next/server";
import { D1Client } from "@/lib/d1";
import { StorageEngine } from "@/lib/server/storage";

export async function GET(req: NextRequest, { params }: { params: Promise<{ mint: string }> }) {
    try {
        const { mint } = await params;
        if (!mint) return NextResponse.json({ error: "Missing mint" }, { status: 400 });

        const env = (process as any).env;

        let state: any;
        if (env?.DB) {
            const results = await D1Client.query("SELECT * FROM creature_states WHERE mint = ?", [mint], env);
            state = results[0] || null;
        } else {
            const states = await StorageEngine.read<any>("creature_states", {}, env);
            state = states[mint] || null;
        }

        if (!state) {
            return NextResponse.json({ success: false, error: "Creature not found" }, { status: 404 });
        }

        return NextResponse.json({ success: true, state });

    } catch (e: any) {
        console.error("Fetch Failed:", e);
        return NextResponse.json({ success: false, error: "Internal Server Error" }, { status: 500 });
    }
}
