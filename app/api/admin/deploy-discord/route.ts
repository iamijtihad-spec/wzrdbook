
import { NextResponse } from 'next/server';
import { setup } from '@/lib/discord-setup';

export async function POST() {
    try {
        console.log("Admin initiated Discord Deployment...");
        const result = await setup();
        return NextResponse.json(result);
    } catch (error) {
        console.error("Deployment failed:", error);
        return NextResponse.json({ success: false, error: String(error) }, { status: 500 });
    }
}


export const runtime = 'edge';