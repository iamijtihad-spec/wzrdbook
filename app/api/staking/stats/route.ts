import { NextResponse } from "next/server";


export async function GET(req: Request) {
    try {
        const { searchParams } = new URL(req.url);
        const wallet = searchParams.get("wallet");

        if (!wallet) return NextResponse.json({ error: "Wallet required" }, { status: 400 });

        const env = (process as any).env;
        const { StorageEngine } = await import("@/lib/server/storage");
        const stakes = await StorageEngine.read<any[]>("stakes", [], env);

        const activeStakes = stakes.filter((s: any) => s.wallet === wallet && s.status === 'Active');
        const stakedAmount = activeStakes.reduce((sum: number, s: any) => sum + (Number(s.amount) || 0), 0);

        return NextResponse.json({ stakedAmount, activeCount: activeStakes.length });
    } catch (e: any) {
        return NextResponse.json({ error: e.message }, { status: 500 });
    }
}
