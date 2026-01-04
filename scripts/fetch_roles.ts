
import fetch from 'node-fetch';

const BOT_TOKEN = "MTQ0OTQ5MDk1MzI1NjU2NjgzNw.GtlTuj.hJME9r-4-hLV1gL3kYp5wEbIWnse0waqJSBqog";
const GUILD_ID = "1449490560640614461";

async function getRoles() {
    const response = await fetch(`https://discord.com/api/guilds/${GUILD_ID}/roles`, {
        headers: {
            Authorization: `Bot ${BOT_TOKEN}`
        }
    });

    const roles = await response.json();
    console.log(JSON.stringify(roles, null, 2));
}

getRoles();
