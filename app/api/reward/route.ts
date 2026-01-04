import { NextRequest, NextResponse } from "next/server";

export async function POST(request: NextRequest) {
    try {
        const body = await request.json();
        const { wallet, domain } = body;

        if (!wallet) {
            return NextResponse.json(
                { error: "Wallet address required" },
                { status: 400 }
            );
        }

        // --- DOMAIN FIREWALL ---
        if (domain === "ASCESIS") {
            return NextResponse.json({
                success: false,
                reward: 0,
                message: "L2E Disabled in Ascesis Domain: Value must be sacrificed, not earned."
            });
        }
        // -----------------------

        // Mock L2E Logic for Sovereign/Heritage
        const rewardAmount = Math.floor(Math.random() * 5) + 1; // 1-5 tokens

        return NextResponse.json({
            success: true,
            reward: rewardAmount,
            message: `Artifact resonance detected. Collected ${rewardAmount} GRIT.`
        });

    } catch (error) {
        console.error("Error processing reward:", error);
        return NextResponse.json(
            { error: "Failed to process reward" },
            { status: 500 }
        );
    }
}
