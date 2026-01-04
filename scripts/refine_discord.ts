
import fetch from 'node-fetch';

const BOT_TOKEN = "MTQ0OTQ5MDk1MzI1NjU2NjgzNw.GtlTuj.hJME9r-4-hLV1gL3kYp5wEbIWnse0waqJSBqog";
const GUILD_ID = "1449490560640614461";

// Role IDs (From previous fetch)
const ROLES = {
    EVERYONE: "1449490560640614461",
    GOLD: "1449492874734604569",
    SILVER: "1449492876470915216",
    BRONZE: "1449492877712293901"
};

async function api(endpoint, method = "GET", body = null) {
    const opts = {
        method,
        headers: {
            Authorization: `Bot ${BOT_TOKEN}`,
            "Content-Type": "application/json"
        }
    };
    if (body) opts.body = JSON.stringify(body);
    const res = await fetch(`https://discord.com/api/guilds/${GUILD_ID}${endpoint}`, opts);
    if (!res.ok) return null; // Simple error handling for script
    return await res.json();
}

// Wrapper for channel operations since some endpoints are /channels/{id}
async function channelApi(id, method = "GET", body = null) {
    const opts = {
        method,
        headers: {
            Authorization: `Bot ${BOT_TOKEN}`,
            "Content-Type": "application/json"
        }
    };
    if (body) opts.body = JSON.stringify(body);
    const res = await fetch(`https://discord.com/api/channels/${id}`, opts);
    return await res.json();
}


async function refine() {
    console.log("Fetching channels...");
    const channels = await api("/channels");

    // 1. DELETE UNNEEDED (Cleanup clutter)
    const toDelete = ["memes", "general", "rules", "moderator-only"]; // Keywords to nuke
    for (const c of channels) {
        // Keep our previous special ones but rename them later. 
        // Delete generic ones we don't want.
        if (toDelete.some(k => c.name.includes(k) && !c.name.includes("council"))) {
            console.log(`Deleting generic channel: ${c.name}`);
            await channelApi(c.id, "DELETE");
        }
    }

    // Refresh list
    let currentChannels = await api("/channels");
    const find = (name) => currentChannels.find(c => c.name.includes(name));

    // 2. CREATE CATEGORIES & MOVE CHANNELS

    // --- A. UNIVERSE (The Start) ---
    console.log("Setting up UNIVERSE...");
    let catUniverse = find("UNIVERSE");
    if (!catUniverse) catUniverse = await api("/channels", "POST", { name: "🌌 UNIVERSE", type: 4 });

    const portal = find("welcome") || find("portal");
    if (portal) await channelApi(portal.id, "PATCH", { name: "🟣-portal", parent_id: catUniverse.id });

    const transmissions = find("announcements") || find("transmissions");
    if (transmissions) await channelApi(transmissions.id, "PATCH", { name: "📡-transmissions", parent_id: catUniverse.id });

    let lobby = find("lobby") || find("general"); // If general survived logic above or we create new
    if (!lobby) lobby = await api("/channels", "POST", { name: "⚡-lobby", type: 0, parent_id: catUniverse.id });


    // --- B. EXCHANGE (GRIT) ---
    console.log("Setting up EXCHANGE...");
    let catExchange = find("EXCHANGE");
    if (!catExchange) catExchange = await api("/channels", "POST", { name: "📈 EXCHANGE (GRIT)", type: 4 });

    let bonding = find("bonding-curve");
    if (!bonding) bonding = await api("/channels", "POST", { name: "💹-bonding-curve", type: 0, parent_id: catExchange.id });
    else await channelApi(bonding.id, "PATCH", { parent_id: catExchange.id });

    let traders = find("traders");
    if (!traders) traders = await api("/channels", "POST", { name: "💸-traders", type: 0, parent_id: catExchange.id });

    // --- C. STAKING (MOXY) ---
    console.log("Setting up STAKING...");
    let catStaking = find("STAKING") || find("CITADEL"); // Rename Citadel
    if (catStaking) await channelApi(catStaking.id, "PATCH", { name: "🔒 STAKING (MOXY)" });
    else catStaking = await api("/channels", "POST", { name: "🔒 STAKING (MOXY)", type: 4 });

    const council = find("council");
    if (council) await channelApi(council.id, "PATCH", { name: "🧠-council-hall", parent_id: catStaking.id });

    const backstage = find("backstage");
    if (backstage) await channelApi(backstage.id, "PATCH", { name: "🥂-inner-sanctum", parent_id: catStaking.id });


    // --- D. BOUNTIES (CHI) ---
    console.log("Setting up BOUNTIES...");
    let catBounties = find("BOUNTIES");
    if (!catBounties) catBounties = await api("/channels", "POST", { name: "⚔️ BOUNTIES (CHI)", type: 4 });

    // Permissions: Only Admin can post in bounty board, everyone read
    let bountyBoard = find("bounty-board");
    if (!bountyBoard) bountyBoard = await api("/channels", "POST", {
        name: "📜-bounty-board",
        type: 0,
        parent_id: catBounties.id,
        permission_overwrites: [{ id: ROLES.EVERYONE, type: 0, deny: "2048" }] // Send Messages
    });

    let merch = find("merch");
    if (!merch) merch = await api("/channels", "POST", { name: "🧢-merch-flex", type: 0, parent_id: catBounties.id });

    // Cleanup old categories if empty (Simple check if possible, or just leave for manual cleanup)
    console.log("Refining complete.");
}

refine();
