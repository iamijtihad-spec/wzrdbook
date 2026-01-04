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

        // Atomic Update of User Profile
        await StorageEngine.update<Record<string, any>>(
            "users",
            (users) => {
                const user = users[wallet] || { wallet, resonance: 0, fiat_balance: 0 };
                // Default handling
                if (typeof user.fiat_balance !== 'number') user.fiat_balance = 0;

                user.fiat_balance += Number(amount);
                return { ...users, [wallet]: user };
            },
            {},
            env
        );

        return NextResponse.json({ success: true, message: `Deposited $${amount}` });

    } catch (e: any) {
        console.error("Fiat Deposit Failed:", e);
        return NextResponse.json({ error: e.message }, { status: 500 });
    }
}
