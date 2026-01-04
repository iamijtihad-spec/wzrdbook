import { NextRequest, NextResponse } from "next/server";
import fs from 'fs';
import path from 'path';
import ringsConfig from "@/config/rings.json";

export async function POST(req: NextRequest) {
    try {
        const { ringId, content } = await req.json();

        // 1. Validate
        if (!ringId || !content) {
            return NextResponse.json({ error: "Missing ringId or content" }, { status: 400 });
        }

        // 2. Find Ring
        const ringIndex = ringsConfig.rings.findIndex(r => r.id === ringId);
        if (ringIndex === -1) {
            return NextResponse.json({ error: "Ring not found" }, { status: 404 });
        }

        // 3. Update Content
        // In a real app we would validate content structure
        ringsConfig.rings[ringIndex].content.push(content);

        // 4. Persist to File (Serverside)
        // Note: This relies on the environment allowing writes (Localhost yes, Vercel no)
        // For Vercel, this would need to update a DB. We assume local/dev environment here.
        const configPath = path.join(process.cwd(), 'config', 'rings.json');
        fs.writeFileSync(configPath, JSON.stringify(ringsConfig, null, 4));

        return NextResponse.json({ success: true, ringId });
    } catch (e: unknown) {
        const errorMessage = e instanceof Error ? e.message : 'Unknown error';
        console.error(e);
        return NextResponse.json({ error: errorMessage }, { status: 500 });
    }
}
