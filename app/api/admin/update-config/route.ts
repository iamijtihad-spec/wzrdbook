import { NextRequest, NextResponse } from "next/server";
import fs from "fs";
import path from "path";

const CONFIG_PATH = path.join(process.cwd(), "config/artist.config.json");

export async function POST(req: NextRequest) {
    try {
        const body = await req.json();
        const { stems } = body;

        // Read existing config
        if (!fs.existsSync(CONFIG_PATH)) {
            return NextResponse.json({ success: false, error: "Config file not found" }, { status: 404 });
        }

        const currentConfig = JSON.parse(fs.readFileSync(CONFIG_PATH, "utf-8"));

        // Update Stems / Domain Gates
        // Assuming we are updating the first collection item for this demo
        // In a real app, we'd find the specific collection item by ID
        if (currentConfig.collection && currentConfig.collection.length > 0) {
            const collectionItem = currentConfig.collection[0];

            // Transform the flat stem list from console back into domain_gates object
            const newDomainGates: Record<string, string> = {};
            stems.forEach((s: { name: string, domain: string }) => {
                // Heuristic: map filename to a simple key if needed, or just use filename
                // For simplicity here, we assume the stem name IS the key or we map it
                const key = s.name.split('.')[0].toLowerCase(); // e.g. "Lead_Vocal.wav" -> "lead_vocal"
                newDomainGates[key] = s.domain;
            });

            collectionItem.domain_gates = newDomainGates;
            // Also update the 'stems' array to match if needed, though usually just filenames
            collectionItem.stems = stems.map((s: { name: string }) => s.name);
        }

        // Save Config
        fs.writeFileSync(CONFIG_PATH, JSON.stringify(currentConfig, null, 2));

        return NextResponse.json({ success: true });

    } catch (error) {
        console.error("Error updating config:", error);
        return NextResponse.json({ success: false, error: "Internal Server Error" }, { status: 500 });
    }
}


export const runtime = 'edge';