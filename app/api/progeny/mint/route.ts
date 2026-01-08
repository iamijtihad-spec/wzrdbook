import { NextRequest, NextResponse } from "next/server";

// Stubbed for Edge Compatibility - Metaplex SDK is too heavy for Edge Runtime
export async function POST(req: NextRequest) {
    try {
        const body = await req.json();
        const { wallet } = body;

        if (!wallet) return NextResponse.json({ success: false, error: "Missing wallet" }, { status: 400 });

        console.log(`[STUB] Minting requested for ${wallet} - Server-side minting disabled on Edge.`);

        return NextResponse.json({
            success: false,
            error: "Server-side minting temporarily disabled. Please use client-side minting."
        }, { status: 501 });

    } catch (e: any) {
        console.error("Minting Stub Error:", e);
        return NextResponse.json({ success: false, error: "Internal Error" }, { status: 500 });
    }
}

export const runtime = 'edge';