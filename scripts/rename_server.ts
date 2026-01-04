
import fetch from 'node-fetch';

const BOT_TOKEN = "MTQ0OTQ5MDk1MzI1NjU2NjgzNw.GtlTuj.hJME9r-4-hLV1gL3kYp5wEbIWnse0waqJSBqog";
const GUILD_ID = "1449490560640614461";

async function renameServer() {
    console.log("Renaming server to WZRDCLVB...");
    const res = await fetch(`https://discord.com/api/guilds/${GUILD_ID}`, {
        method: "PATCH",
        headers: {
            Authorization: `Bot ${BOT_TOKEN}`,
            "Content-Type": "application/json"
        },
        body: JSON.stringify({
            name: "WZRDCLVB"
        })
    });

    if (res.ok) {
        console.log("Success! Server renamed.");
    } else {
        console.log("Failed:", await res.json());
    }
}

renameServer();
