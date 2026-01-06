
import { NextResponse } from "next/server";
import fs from "fs";
import path from "path";

const CHAT_FILE = path.join(process.cwd(), "data", "chat.json");

// Ensure data exists
if (!fs.existsSync(CHAT_FILE)) {
    fs.mkdirSync(path.dirname(CHAT_FILE), { recursive: true });
    fs.writeFileSync(CHAT_FILE, JSON.stringify([]));
}

export const dynamic = 'force-dynamic';

export async function GET() {
    try {
        const fileContent = fs.readFileSync(CHAT_FILE, "utf-8");
        const chat = JSON.parse(fileContent);
        // Return last 50 messages
        return NextResponse.json({ success: true, messages: chat.slice(-50) });
    } catch (e) {
        return NextResponse.json({ success: false, messages: [] });
    }
}

export async function POST(req: Request) {
    try {
        const body = await req.json();
        const { username, content, avatar, channel, timestamp } = body;

        let chat = [];
        if (fs.existsSync(CHAT_FILE)) {
            const data = fs.readFileSync(CHAT_FILE, "utf-8");
            chat = JSON.parse(data);
        }

        const newMessage = {
            id: Date.now().toString(),
            username,
            content,
            avatar,
            channel,
            timestamp: timestamp || Date.now()
        };

        chat.push(newMessage);

        // Cap at 100
        if (chat.length > 100) {
            chat = chat.slice(chat.length - 100);
        }

        fs.writeFileSync(CHAT_FILE, JSON.stringify(chat, null, 2));

        return NextResponse.json({ success: true });
    } catch (e) {
        console.error("Chat Post Error", e);
        return NextResponse.json({ success: false, error: "Failed to save message" }, { status: 500 });
    }
}


export const runtime = 'edge';