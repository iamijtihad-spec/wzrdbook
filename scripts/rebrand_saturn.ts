
import fetch from 'node-fetch';

const BOT_TOKEN = "MTQ0OTQ5MDk1MzI1NjU2NjgzNw.GtlTuj.hJME9r-4-hLV1gL3kYp5wEbIWnse0waqJSBqog";
const GUILD_ID = "1449490560640614461";

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
    if (!res.ok) return null;
    return await res.json();
}

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

async function rebrand() {
    console.log("Initializing Protocol SATURN...");

    // 1. Rename Server
    await api("", "PATCH", { name: "SATURN" });

    // 2. Fetch Channels
    const channels = await api("/channels");
    const find = (name) => channels.find(c => c.name.includes(name));

    // 3. Create Structure

    // --- A. THE NUCLEUS (Core Ecosystem) ---
    // Formerly "UNIVERSE" and "EXCHANGE" and "BOUNTIES" live here as the "Global" layer
    let nucleus = find("NUCLEUS");
    if (!nucleus) nucleus = await api("/channels", "POST", { name: "🌑 THE NUCLEUS", type: 4 }); // Category

    // Move Global stuff here
    const move = async (k, newParent) => {
        const c = find(k);
        if (c) await channelApi(c.id, "PATCH", { parent_id: newParent });
    };

    await move("portal", nucleus.id);        // Rules
    await move("transmissions", nucleus.id); // Announcements
    await move("lobby", nucleus.id);         // General Chat
    await move("bonding", nucleus.id);       // Token trading
    await move("bounty", nucleus.id);        // Bounties

    // --- B. RING I: THE ARCANUM (WZRDCLVB) ---
    // Formerly "STAKING" (Council/Sanctum) - This is the Artist's Ring
    let ring1 = find("RING I");
    if (!ring1) ring1 = await api("/channels", "POST", { name: "💍 RING I: THE ARCANUM", type: 4 });

    await move("council", ring1.id);
    await move("sanctum", ring1.id); // Renamed to Inner Sanctum previously

    // Create an "Exhibit" channel for the artist
    await api("/channels", "POST", { name: "🎨-gallery", type: 0, parent_id: ring1.id });
    await api("/channels", "POST", { name: "🎵-listening-party", type: 2, parent_id: ring1.id }); // Voice

    // --- C. PLACEHOLDER RINGS ---
    const rings = [
        "RING II: THE NEBULA",
        "RING III: THE OBSIDIAN",
        "RING IV: THE HELIX",
        "RING V: THE MERIDIAN",
        "RING VI: THE AETHER",
        "RING VII: THE HORIZON"
    ];

    for (const rName of rings) {
        if (!find(rName.split(":")[0])) { // Check if "RING II" exists
            const cat = await api("/channels", "POST", { name: `⭕ ${rName}`, type: 4 });
            // Locked channel
            await api("/channels", "POST", {
                name: "🔒-locked-frequency",
                type: 0,
                parent_id: cat.id,
                permission_overwrites: [{ id: GUILD_ID, type: 0, deny: "1024" }] // Deny view
            });
        }
    }

    // Cleanup old categories
    console.log("Deleting old empty categories...");
    const oldCats = ["UNIVERSE", "EXCHANGE", "STAKING", "BOUNTIES", "CITADEL"];
    const updatedChannels = await api("/channels"); // Refresh
    for (const c of updatedChannels) {
        if (c.type === 4 && oldCats.some(cancel => c.name.includes(cancel)) && !c.name.includes("RING")) {
            console.log("Deleting:", c.name);
            await channelApi(c.id, "DELETE");
        }
    }

    console.log("Saturn Structure Established.");
}

rebrand();
