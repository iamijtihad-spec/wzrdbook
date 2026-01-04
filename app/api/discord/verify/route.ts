import { NextRequest, NextResponse } from "next/server";
import { Connection, PublicKey } from "@solana/web3.js";
import { getAssociatedTokenAddress, getAccount } from "@solana/spl-token";

const BOT_TOKEN = process.env.DISCORD_BOT_TOKEN || "MTQ0OTQ5MDk1MzI1NjU2NjgzNw.GtlTuj.hJME9r-4-hLV1gL3kYp5wEbIWnse0waqJSBqog";
const GUILD_ID = "1449490560640614461"; // From your link
const MOXY_MINT = "2FFhBNoCqsgXejrqQXk3gJXWyG9nuiE7qj4Sv2wrcnwq";

// Role IDs (Placeholder - You need to fill these from your server!)
const ROLES = {
    GOLD: "1449492874734604569",     // DIAMOND HANDS
    SILVER: "1449492876470915216",   // COIN HOLDER
    BRONZE: "1449492877712293901",   // INITIATE
    VERIFIED: "1449492878773719052"  // Verified
};

export async function POST(req: NextRequest) {
    try {
        const { wallet, discordId } = await req.json();

        if (!wallet || !discordId) {
            return NextResponse.json({ error: "Missing wallet or discordId" }, { status: 400 });
        }

        // 1. Check MOXY Balance
        const connection = new Connection("https://api.devnet.solana.com");
        const ata = await getAssociatedTokenAddress(new PublicKey(MOXY_MINT), new PublicKey(wallet));
        let balance = 0;
        try {
            const acc = await getAccount(connection, ata);
            balance = Number(acc.amount) / 1_000_000_000;
        } catch {
            balance = 0;
        }

        // 2. Determine Roles
        const rolesToAdd = [];
        if (balance >= 10000) rolesToAdd.push(ROLES.GOLD);
        if (balance >= 1000) rolesToAdd.push(ROLES.SILVER);
        if (balance >= 100) rolesToAdd.push(ROLES.BRONZE);
        rolesToAdd.push(ROLES.VERIFIED);

        // 3. Assign Roles via Discord Bot API
        for (const roleId of rolesToAdd) {
            if (roleId.includes("REPLACE")) continue; // Skip placeholders

            await fetch(`https://discord.com/api/guilds/${GUILD_ID}/members/${discordId}/roles/${roleId}`, {
                method: "PUT",
                headers: {
                    Authorization: `Bot ${BOT_TOKEN}`,
                    "Content-Type": "application/json"
                }
            });
        }

        return NextResponse.json({ success: true, balance, rolesAssigned: rolesToAdd.length });

    } catch (error: any) {
        console.error("Verification failed:", error);
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}
