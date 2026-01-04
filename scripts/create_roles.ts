
import fetch from 'node-fetch';

const BOT_TOKEN = "MTQ0OTQ5MDk1MzI1NjU2NjgzNw.GtlTuj.hJME9r-4-hLV1gL3kYp5wEbIWnse0waqJSBqog";
const GUILD_ID = "1449490560640614461";

const ROLES_TO_CREATE = [
    { name: "DIAMOND HANDS", color: 0x00FFFF, hoist: true }, // Cyan
    { name: "COIN HOLDER", color: 0xC0C0C0, hoist: true },   // Silver
    { name: "INITIATE", color: 0xCD7F32, hoist: true },      // Bronze
    { name: "Verified", color: 0x00FF00, hoist: false }      // Green
];

async function createRoles() {
    // 1. Get existing roles
    const response = await fetch(`https://discord.com/api/guilds/${GUILD_ID}/roles`, {
        headers: { Authorization: `Bot ${BOT_TOKEN}` }
    });
    const existingRoles = await response.json();
    console.log("Existing roles:", existingRoles.map(r => r.name));

    const roleIds = {};

    // 2. Create missing roles
    for (const roleDef of ROLES_TO_CREATE) {
        const existing = existingRoles.find(r => r.name === roleDef.name);
        if (existing) {
            console.log(`Role '${roleDef.name}' already exists: ${existing.id}`);
            roleIds[roleDef.name] = existing.id;
        } else {
            console.log(`Creating role '${roleDef.name}'...`);
            const createRes = await fetch(`https://discord.com/api/guilds/${GUILD_ID}/roles`, {
                method: "POST",
                headers: {
                    Authorization: `Bot ${BOT_TOKEN}`,
                    "Content-Type": "application/json"
                },
                body: JSON.stringify(roleDef)
            });
            const newRole = await createRes.json();
            if (newRole.id) {
                console.log(`Created! ID: ${newRole.id}`);
                roleIds[roleDef.name] = newRole.id;
            } else {
                console.error(`Failed to create ${roleDef.name}:`, JSON.stringify(newRole));
            }
        }
    }

    console.log("\n--- ROLE CONFIGURATION ---");
    console.log(JSON.stringify(roleIds, null, 2));
}

createRoles();
