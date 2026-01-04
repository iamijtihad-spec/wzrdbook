
import { NextResponse } from "next/server";
import fs from "fs";
import path from "path";

const CONFIG_PATH = path.join(process.cwd(), "config/artist.config.json");

export async function GET() {
    try {
        if (!fs.existsSync(CONFIG_PATH)) {
            return NextResponse.json({ error: "Config not found" }, { status: 404 });
        }
        const config = JSON.parse(fs.readFileSync(CONFIG_PATH, "utf-8"));
        return NextResponse.json(config);
    } catch (error) {
        return NextResponse.json({ error: "Server Error" }, { status: 500 });
    }
}
