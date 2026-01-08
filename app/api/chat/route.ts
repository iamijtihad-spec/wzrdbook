
import { NextResponse } from "next/server";


// In-memory chat for Edge Runtime (resets on cold start)
// For production, this should swap to Cloudflare D1 or KV
const chatMemory: any[] = [];

export const dynamic = 'force-dynamic';

export async function GET() {
    // Return last 50 messages
    return NextResponse.json({ success: true, messages: chatMemory.slice(-50) });
}

export async function POST(req: Request) {
    try {
        const body = await req.json();
        const { username, content, avatar, channel, timestamp } = body;

        const newMessage = {
            id: Date.now().toString(),
            username,
            content,
            avatar,
            channel,
            timestamp: timestamp || Date.now()
        };

        chatMemory.push(newMessage);

        // Cap at 100
        if (chatMemory.length > 100) {
            chatMemory.splice(0, chatMemory.length - 100);
        }

        return NextResponse.json({ success: true });
    } catch (e) {
        console.error("Chat Post Error", e);
        return NextResponse.json({ success: false, error: "Failed to save message" }, { status: 500 });
    }
}


export const runtime = 'edge';