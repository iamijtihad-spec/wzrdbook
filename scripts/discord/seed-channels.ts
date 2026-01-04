
import { Client, GatewayIntentBits, EmbedBuilder, TextChannel } from 'discord.js';
import dotenv from 'dotenv';
dotenv.config({ path: '.env.local' });

const DISCORD_TOKEN = process.env.DISCORD_BOT_TOKEN;
const GUILD_ID = process.env.DISCORD_GUILD_ID || "1449490560640614461";

if (!DISCORD_TOKEN) {
    console.error("❌ Missing DISCORD_BOT_TOKEN");
    process.exit(1);
}

const client = new Client({
    intents: [GatewayIntentBits.Guilds]
});

// Domain Philosophy & Logic Definitions
const MANIFESTOS = {
    // SOVEREIGN
    "👋-signals": {
        title: "The Signal Begins",
        color: 0xFFFFFF, // White
        description: "Welcome to the Grit Protocol.\n\nYou have entered the Sovereign Domain. Here, you exist as you are—unbound, observing, waiting.",
        fields: [
            { name: "🔍 Logic", value: "Connect your wallet on the Dashboard to verify your existence." },
            { name: "📜 Philosophy", value: "*\"Identity is the first artifact of consciousness.\"*" },
            { name: "⚡ Action", value: "Head to the Dashboard to begin your journey." }
        ]
    },
    // ASCESIS
    "🔥-the-pyre": {
        title: "The Ascesis Ritual",
        color: 0xFF0000, // Red
        description: "This is the domain of pure cost. To proceed, one must give up what they value.",
        fields: [
            { name: "🔥 Logic", value: "**Burn-to-Enter**: You must Sacrifice GRIT to earn Scars.\n**Listen-to-Earn**: Accrue Resonance by tuning into the frequency." },
            { name: "📜 Philosophy", value: "*\"Value is defined by what you are willing to destroy.\"*" },
            { name: "⚡ Commands", value: "Use `/sacrifice` to generate a Burn Link." }
        ]
    },
    "🎧-resonance": {
        title: "Frequency Calibration",
        color: 0x990000,
        description: "Discuss the transmissions here. Proof of Listening is required to maintain resonance.",
        fields: [
            { name: "🌌 Logic", value: "Resonance decays over time. Keep listening." }
        ]
    },
    // HERITAGE
    "🏛-the-vault": {
        title: "The Heritage Vault",
        color: 0xFFD700, // Gold
        description: "Only the Scarred may enter. Here, we do not spend; we withstand.",
        fields: [
            { name: "⏳ Logic", value: "**Staking**: Lock your GRIT to earn tenure. Access to the Market is granted only to those who wait." },
            { name: "📜 Philosophy", value: "*\"Legacy is not built in a day, but in the patience between days.\"*" }
        ]
    },
    "📜-legacy": {
        title: " governance.ts",
        color: 0xDAA520,
        description: "The Council meets here. Proposals shape the physics of the protocol.",
        fields: [
            { name: "⚖️ Logic", value: "1 Token = 1 Vote? No. **1 Scar = 1 Voice.**" }
        ]
    },
    // MARKET
    "📈-bonding-curve": {
        title: "The Market (Unstable)",
        color: 0x0000FF, // Blue
        description: "The final domain. Fluid, volatile, necessary.",
        fields: [
            { name: "📉 Logic", value: "Bonding Curves determine price. Early believers set the floor." },
            { name: "📜 Philosophy", value: "*\"Flow is the only truth.\"*" }
        ]
    }
};

async function seed() {
    try {
        const guild = await client.guilds.fetch(GUILD_ID);
        if (!guild) throw new Error("Guild not found");
        console.log(`Connected to ${guild.name}`);

        const channels = await guild.channels.fetch();

        for (const [channelName, content] of Object.entries(MANIFESTOS)) {
            const channel = channels.find(c => c?.name === channelName && c.isTextBased()) as TextChannel;

            if (channel) {
                console.log(`Seeding ${channelName}...`);

                // Clear previous bot messages? (Optional, maybe dangerous)
                // For now, just append.

                const embed = new EmbedBuilder()
                    .setTitle(content.title)
                    .setColor(content.color)
                    .setDescription(content.description);

                if (content.fields) {
                    embed.addFields(content.fields);
                }

                await channel.send({ embeds: [embed] });
            } else {
                console.warn(`⚠️ Channel not found: ${channelName}`);
            }
        }

        console.log("✅ Seeding Complete.");
        process.exit(0);

    } catch (e) {
        console.error(e);
        process.exit(1);
    }
}

client.once('ready', () => {
    seed();
});

client.login(DISCORD_TOKEN);
