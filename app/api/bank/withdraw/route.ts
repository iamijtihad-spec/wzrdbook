import { NextResponse } from "next/server";

export async function POST(req: Request) {
    try {
        const body = await req.json();
        const { wallet, amount } = body;

        if (!wallet || !amount) {
            return NextResponse.json({ error: "Missing fields" }, { status: 400 });
        }

        const { StorageEngine } = await import("@/lib/server/storage");
        const env = (process as any).env;

        let success = false;

        // Atomic Update
        await StorageEngine.update<Record<string, any>>(
            "users",
            (users) => {
                const user = users[wallet];
                if (!user || (user.fiat_balance || 0) < amount) {
                    throw new Error("Insufficient Funds");
                }

                user.fiat_balance -= Number(amount);
                // Simulate Payout
                success = true;
                return { ...users, [wallet]: user };
            },
            {},
            env
        );

        return NextResponse.json({ success: true, message: `Withdrew $${amount}` });

    } catch (e: any) {
        console.error("Fiat Withdraw Failed:", e);
        return NextResponse.json({ error: e.message }, { status: 500 });
    }
}
