
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

    // Find files
    const files = fs.readdirSync(ASSETS_DIR);
    const iconFile = files.find(f => f.includes("saturn_server_icon"));
    const bannerFile = files.find(f => f.includes("saturn_banner_organic"));

    if (!iconFile || !bannerFile) {
        console.error("Missing files:", { icon: iconFile, banner: bannerFile });
        return;
    }

    const iconData = toDataUri(iconFile);
    const bannerData = toDataUri(bannerFile);

    console.log(`Uploading to SATURN...`);

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
        console.log("Success! Saturn Branding applied.");
    } else {
        console.log("Failed:", await res.json());
    }
}

upload();
