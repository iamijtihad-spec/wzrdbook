import { NextRequest, NextResponse } from "next/server";
// import fs from "fs"; // Disabled for Edge
// import path from "path";

// const CONFIG_PATH = path.join(process.cwd(), "config/artist.config.json");

export async function POST(req: NextRequest) {
    try {
        const body = await req.json();
        const { stems } = body;

        console.warn("Config update requested but invalid in Edge Runtime (Read-Only FS). Stems:", stems);

        return NextResponse.json({
            success: false,
            error: "Configuration updates are disabled in Edge Runtime (read-only filesystem). Please update 'artist.config.json' in the repository."
        }, { status: 403 });

    } catch (error) {
        console.error("Error updating config:", error);
        return NextResponse.json({ success: false, error: "Internal Server Error" }, { status: 500 });
    }
}

export const runtime = 'edge';