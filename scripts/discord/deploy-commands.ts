
import { REST, Routes, SlashCommandBuilder } from 'discord.js';
import dotenv from 'dotenv';
dotenv.config({ path: '.env.local' });

const DISCORD_TOKEN = process.env.DISCORD_BOT_TOKEN;
const CLIENT_ID = process.env.DISCORD_CLIENT_ID || "1449490953256064461"; // Helper Bot ID
const GUILD_ID = process.env.DISCORD_GUILD_ID || "1449490560640614461";

if (!DISCORD_TOKEN) {
    console.error("❌ Missing DISCORD_BOT_TOKEN");
    process.exit(1);
}

const commands = [
    new SlashCommandBuilder()
        .setName('sacrifice')
        .setDescription('Generate a link to the Ascesis Pyre.'),
    new SlashCommandBuilder()
        .setName('sync')
        .setDescription('Manually sync your wallet status to Discord roles.')
        .addStringOption(option =>
            option.setName('wallet')
                .setDescription('Your Solana Wallet Address')
                .setRequired(true)),
    new SlashCommandBuilder()
        .setName('rank')
        .setDescription('View your current Resonance Level and XP Card.'),
    new SlashCommandBuilder()
        .setName('leaderboard')
        .setDescription('View the top 10 Resonators.')
]
    .map(command => command.toJSON());

const rest = new REST({ version: '10' }).setToken(DISCORD_TOKEN);

async function deploy() {
    try {
        console.log('Started refreshing application (/) commands.');

        // Guild-level deployment for Dev (Instant update)
        await rest.put(
            Routes.applicationGuildCommands(CLIENT_ID, GUILD_ID),
            { body: commands },
        );

        console.log('✅ Successfully reloaded application (/) commands.');
    } catch (error) {
        console.error(error);
    }
}

deploy();
