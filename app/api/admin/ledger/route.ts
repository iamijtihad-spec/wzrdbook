
import { NextResponse } from "next/server";
import { ServerLedger } from "@/lib/server-ledger";

export const dynamic = 'force-dynamic';

export async function GET() {
    try {
        const entries = ServerLedger.getRecent(50);
        return NextResponse.json({ success: true, entries });
    } catch (e) {
        return NextResponse.json({ success: false, error: "Failed to read ledger" }, { status: 500 });
    }
}
