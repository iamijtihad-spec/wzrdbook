
import fetch from 'node-fetch';
import fs from 'fs';
import path from 'path';

const BOT_TOKEN = "MTQ0OTQ5MDk1MzI1NjU2NjgzNw.GtlTuj.hJME9r-4-hLV1gL3kYp5wEbIWnse0waqJSBqog";
const GUILD_ID = "1449490560640614461";
const ASSETS_DIR = path.join(process.cwd(), 'public', 'discord-assets');

// Helper to get Data URI
function toDataUri(filename) {
    const filePath = path.join(ASSETS_DIR, filename);
    if (!fs.existsSync(filePath)) return null;
    const bitmap = fs.readFileSync(filePath);
    const base64 = Buffer.from(bitmap).toString('base64');
    return `data:image/png;base64,${base64}`;
}

async function upload() {
    console.log("Encoding assets...");

    // Find the correct files (using basic matching since timestamps vary)
    const files = fs.readdirSync(ASSETS_DIR);
    const iconFile = files.find(f => f.includes("discord_server_icon"));
    const bannerFile = files.find(f => f.includes("server_banner_wzrdclvb"));

    if (!iconFile || !bannerFile) {
        console.error("Could not find icon or banner in", ASSETS_DIR);
        return;
    }

    const iconData = toDataUri(iconFile);
    const bannerData = toDataUri(bannerFile);

    console.log(`Uploading Icon: ${iconFile}`);
    console.log(`Uploading Banner: ${bannerFile}`);

    const res = await fetch(`https://discord.com/api/guilds/${GUILD_ID}`, {
        method: "PATCH",
        headers: {
            Authorization: `Bot ${BOT_TOKEN}`,
            "Content-Type": "application/json"
        },
        body: JSON.stringify({
            icon: iconData,
            banner: bannerData
        })
    });

    if (res.ok) {
        console.log("Success! Branding applied.");
    } else {
        console.log("Failed:", await res.json());
    }
}

upload();
