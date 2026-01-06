
import { NextRequest, NextResponse } from "next/server";
import { syncDiscordToDomain } from "@/scripts/discord/domain-manager";
import { Client, GatewayIntentBits } from "discord.js";

// Initialize Bot Client (Note: In Next.js serverless, maintaining a persistent WS connection is hard. 
// Ideally, this webhook would talk to a separate running Bot process. 
// For this prototype, we'll instantiate, perform action, and destroy, OR assume this route pushes to a queue.)

// For the purposes of this specific task, we'll try to perform a "One-Shot" action if token is present, 
// or mostly just log that we WOULD have done it.
const client = new Client({ intents: [GatewayIntentBits.Guilds] });

export async function POST(req: NextRequest) {
    try {
        const body = await req.json();
        const { event, data } = body;

        console.log(`Received Discord Webhook Event: ${event}`, data);

        if (event === 'ARTIST_UPDATE_CONFIG') {
            // New Domain Mapping logic
            /* 
            if (process.env.DISCORD_BOT_TOKEN) {
               await client.login(process.env.DISCORD_BOT_TOKEN);
               await syncDiscordToDomain(client, data.domain); // e.g. 'ASCESIS'
               client.destroy();
            }
            */
            console.log(`Triggering Domain Sync for ${data.domain}`);
        }

        return NextResponse.json({ success: true, message: "Webhook processed" });

    } catch (error: any) {
        console.error("Discord Webhook Error:", error);
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}


export const runtime = 'edge';