import { NextResponse } from "next/server";

export async function GET(req: Request) {
    try {
        const { searchParams } = new URL(req.url);
        const wallet = searchParams.get("wallet");

        if (!wallet) return NextResponse.json({ error: "Wallet required" }, { status: 400 });

        const { StorageEngine } = await import("@/lib/server/storage");
        const env = (process as any).env;

        const users = await StorageEngine.read<Record<string, any>>("users", {}, env);
        const user = users[wallet];
        const balance = user?.fiat_balance || 0;

        return NextResponse.json({ balance });
    } catch (e: any) {
        return NextResponse.json({ error: e.message }, { status: 500 });
    }
}


export const runtime = 'edge';