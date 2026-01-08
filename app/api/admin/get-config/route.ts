import { NextResponse } from "next/server";
import artistConfig from "@/config/artist.config.json";

export async function GET() {
    try {
        return NextResponse.json(artistConfig);
    } catch (error) {
        return NextResponse.json({ error: "Server Error" }, { status: 500 });
    }
}

// Edge-compatible config loader
export const runtime = 'edge';