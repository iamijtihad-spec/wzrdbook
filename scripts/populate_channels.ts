
// @ts-ignore
import fetch from 'node-fetch';

const BOT_TOKEN = process.env.DISCORD_BOT_TOKEN || "";
const GUILD_ID = "1449490560640614461";
const DASHBOARD_URL = "https://wzrdbook.com"; // Or localhost if testing

interface EmbedField {
    name: string;
    value: string;
    inline?: boolean;
}

interface EmbedImage {
    url: string;
}

interface Embed {
    title?: string;
    description?: string;
    color?: number;
    fields?: EmbedField[];
    image?: EmbedImage;
}

async function sendMessage(channelId: string, content: string, embeds: Embed[] = []) {
    if (!channelId) return;
    console.log(`Sending to ${channelId}...`);
    await fetch(`https://discord.com/api/channels/${channelId}/messages`, {
        method: "POST",
        headers: {
            Authorization: `Bot ${BOT_TOKEN}`,
            "Content-Type": "application/json"
        },
        body: JSON.stringify({ content, embeds })
    });
}

async function populate() {
    // 1. Get Channels
    const res = await fetch(`https://discord.com/api/guilds/${GUILD_ID}/channels`, {
        headers: { Authorization: `Bot ${BOT_TOKEN}` }
    });
    const channels: any[] = await res.json();

    // Helper to find channel by name
    const findCh = (name: string) => channels.find((c: any) => c.name.includes(name))?.id;

    const welcomeId = findCh("welcome");
    const announcementsId = findCh("announcements");
    const generalId = findCh("general");
    const councilId = findCh("council");
    const backstageId = findCh("backstage");

    // --- #WELCOME (Rules) ---
    await sendMessage(welcomeId, "", [{
        title: "📜 THE CODE OF THE WZRD",
        description: "Welcome to the WZRDCLVB. This is an exclusive token-gated community.\n\n**1. RESPECT THE HIERARCHY**\nRoles are earned on-chain. Respect the Gold and Silver tiers.\n\n**2. GOOD VIBES ONLY**\nWe are here to build, earn, and ascend. No FUD.\n\n**3. STAY LIQUID**\nKeep your wallets ready. Opportunities arise quickly.",
        color: 0x9945FF, // Purple
        fields: [
            { name: "💎 GRIT (Equity)", value: "Hold GRIT to bond with the artist.", inline: true },
            { name: "👑 MOXY (Loyalty)", value: "Stake MOXY to unlock roles here.", inline: true },
            { name: "⚡ CHI (Utility)", value: "Earn and spend CHI in the store.", inline: true }
        ],
        image: { url: "https://imagedelivery.net/example-banner.png" } // Placeholder or use attachment if we were advanced
    }]);

    await sendMessage(welcomeId, "👇 **VERIFY YOUR WALLET TO UNLOCK CHANNELS** 👇\nGo to the Dashboard > Staking Page > Link Discord\n" + DASHBOARD_URL);

    // --- #ANNOUNCEMENTS ---
    await sendMessage(announcementsId, "@everyone **THE DASHBOARD IS LIVE** 🚀\n\nThe WZRD universe has expanded. You can now Bond, Stake, and Earn on the official dApp.\n\n🔗 **Bonding Curve**: Buy GRIT\n🔗 **Staking**: Lock MOXY for Gold/Silver Roles\n🔗 **Bounties**: Earn CHI for tasks\n\nVisit: " + DASHBOARD_URL);

    // --- #GENERAL ---
    await sendMessage(generalId, "The veil is lifted. Welcome to the WZRDCLVB public sea. 🌊\nWhat are we building today?");

    // --- #COUNCIL (Silver) ---
    await sendMessage(councilId, "**Welcome, Coin Holders.** 🪙\n\nYou have staked enough MOXY to enter the Council. Here we discuss the future of the roadmap and vote on governance proposals.\n\n*Your voice matters more than the public.*");

    // --- #BACKSTAGE (Gold) ---
    await sendMessage(backstageId, "**Welcome, Diamond Hands.** 💎\n\nYou are the inner circle. The WZRD King sees you.\n\n- Exclusive alpha drops\n- 1-on-1 access\n- Private listen parties\n\n*Stay tuned.*");

    console.log("Channels populated!");
}

populate();
