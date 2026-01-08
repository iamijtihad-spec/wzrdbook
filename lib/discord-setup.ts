// import dotenv from 'dotenv';
// dotenv.config({ path: '.env.local' });

const BOT_TOKEN = process.env.DISCORD_BOT_TOKEN || "MTQ0OTQ5MDk1MzI1NjU2NjgzNw.GtlTuj.hJME9r-4-hLV1gL3kYp5wEbIWnse0waqJSBqog";
const GUILD_ID = process.env.DISCORD_GUILD_ID || "1449490560640614461";

// Role IDs - These need to be updated with actual IDs after creation or from env
const ROLES = {
    EVERYONE: GUILD_ID, // @everyone role ID is usually the Guild ID
    INITIATE: "1449492877712293901",  // Access to Ascesis (was Bronze)
    SURVIVOR: "1449492876470915216",  // Access to Heritage (was Silver)
    STAKEHOLDER: "1449492874734604569", // Access to Market (was Gold)
};

async function createChannel(name: string, type: number, parentId: string | null, permissionOverwrites: any[] = []) {
    console.log(`Creating channel ${name}...`);
    try {
        const res = await fetch(`https://discord.com/api/guilds/${GUILD_ID}/channels`, {
            method: "POST",
            headers: {
                Authorization: `Bot ${BOT_TOKEN}`,
                "Content-Type": "application/json"
            },
            body: JSON.stringify({
                name,
                type, // 0 = Text, 4 = Category
                parent_id: parentId,
                permission_overwrites: permissionOverwrites
            })
        });

        if (!res.ok) {
            const err = await res.json();
            console.error(`Failed to create ${name}:`, JSON.stringify(err, null, 2));
            return null;
        }

        return await res.json();
    } catch (e) {
        console.error(`Error creating ${name}:`, e);
        return null;
    }
}



export async function setup() {
    console.log("Initializing Discord Domain Architecture...");

    // Permission Constants
    const DENY_VIEW = "1024";
    const ALLOW_VIEW = "1024";
    const DENY_SEND = "2048";

    // 1. SOVEREIGN (Public Layer)
    console.log("\n--- Constructing SOVEREIGN Domain ---");
    const sovereign = await createChannel("⚫ SOVEREIGN", 4, null);
    if (sovereign) {
        await createChannel("👋-signals", 0, sovereign.id, [
            { id: ROLES.EVERYONE, type: 0, deny: DENY_SEND } // Read-only
        ]);
        await createChannel("📢-broadcasts", 0, sovereign.id, [
            { id: ROLES.EVERYONE, type: 0, deny: DENY_SEND } // Read-only
        ]);
        await createChannel("💬-static", 0, sovereign.id); // Public Chat
    }

    // 2. ASCESIS (Gated: Initiate - Resonance)
    console.log("\n--- Constructing ASCESIS Domain ---");
    const ascesis = await createChannel("🔴 ASCESIS", 4, null, [
        { id: ROLES.EVERYONE, type: 0, deny: DENY_VIEW },
        { id: ROLES.INITIATE, type: 0, allow: ALLOW_VIEW }
    ]);
    if (ascesis) {
        await createChannel("🔥-the-pyre", 0, ascesis.id); // Burn logs / discussion
        await createChannel("🎧-resonance", 0, ascesis.id); // Music discussion
    }

    // 3. HERITAGE (Gated: Survivor - Scars)
    console.log("\n--- Constructing HERITAGE Domain ---");
    const heritage = await createChannel("🟡 HERITAGE", 4, null, [
        { id: ROLES.EVERYONE, type: 0, deny: DENY_VIEW },
        { id: ROLES.SURVIVOR, type: 0, allow: ALLOW_VIEW }
    ]);
    if (heritage) {
        await createChannel("🏛-the-vault", 0, heritage.id); // Staking/Rewards
        await createChannel("📜-legacy", 0, heritage.id); // Governance
    }

    // 4. MARKET (Gated: Stakeholder - Time)
    console.log("\n--- Constructing MARKET Domain ---");
    const market = await createChannel("🔵 MARKET", 4, null, [
        { id: ROLES.EVERYONE, type: 0, deny: DENY_VIEW },
        { id: ROLES.STAKEHOLDER, type: 0, allow: ALLOW_VIEW }
    ]);
    if (market) {
        await createChannel("📈-bonding-curve", 0, market.id); // Trading
        await createChannel("💎-otc", 0, market.id);
    }

    console.log("\n✅ Discord Architecture Deployed Successfully.");

    // Return result summary for API
    return { success: true, message: "Discord Architecture Deployed" };
}

// Only run if called directly
// Only run if called directly
// if (import.meta.url === `file://${process.argv[1]}`) {
//     setup();
// }
