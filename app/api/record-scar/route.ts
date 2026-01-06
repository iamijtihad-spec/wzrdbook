import { NextRequest, NextResponse } from "next/server";
import fs from "fs";
import path from "path";

// Local Persistence Layer
const DB_PATH = path.join(process.cwd(), "ecosystem_db.json");

export async function POST(req: NextRequest) {
    try {
        const body = await req.json();
        const { wallet, ringId, burnAmount, burnSignature, tokenMint } = body;

        console.log("🔥 [SCAR RECORDED]", {
            wallet,
            ringId,
            amount: burnAmount,
            signature: burnSignature
        });

        // 1. Read Database
        let db = { scars: [] };
        try {
            if (fs.existsSync(DB_PATH)) {
                const fileContent = fs.readFileSync(DB_PATH, "utf-8");
                const json = JSON.parse(fileContent);
                db = { ...json, scars: json.scars || [] };
            }
        } catch (e) {
            console.error("Failed to read DB, initializing new.", e);
        }

        // 2. Append Scar
        const newScar = {
            id: Date.now().toString(),
            wallet,
            ringId,
            burnAmount,
            burnSignature,
            tokenMint,
            timestamp: Date.now()
        };

        // @ts-ignore
        db.scars.push(newScar);

        // 3. Save Database
        fs.writeFileSync(DB_PATH, JSON.stringify(db, null, 2));

        return NextResponse.json({ success: true, scarId: newScar.id });

    } catch (error) {
        console.error("Error recording scar:", error);
        return NextResponse.json({ success: false, error: "Internal Server Error" }, { status: 500 });
    }
}


export const runtime = 'edge';