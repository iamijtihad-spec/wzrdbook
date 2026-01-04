import { Client, GatewayIntentBits, Partials, REST, Routes } from 'discord.js';
import { Connection, PublicKey } from '@solana/web3.js';
import { getAssociatedTokenAddress, getAccount, TokenAccountNotFoundError, AccountLayout } from '@solana/spl-token';
import dotenv from 'dotenv';
dotenv.config({ path: '.env.local' });

const client = new Client({
    intents: [
        GatewayIntentBits.Guilds,
        GatewayIntentBits.GuildMembers,
        GatewayIntentBits.GuildMessages,
        GatewayIntentBits.MessageContent
    ],
    partials: [Partials.Channel]
});

const DISCORD_TOKEN = process.env.DISCORD_BOT_TOKEN || "";
const GUILD_ID = process.env.DISCORD_GUILD_ID || "1449490560640614461";

// Solana Config
const RPC_URL = process.env.NEXT_PUBLIC_SOLANA_RPC_URL || "https://api.devnet.solana.com";
const connection = new Connection(RPC_URL, "confirmed");
const GRIT_MINT = new PublicKey(process.env.GRIT_MINT || "CS8ZQMdJ5t5hNuM51LXJBU4zBysZWAkFj9oJ6MwtnHsS");

// Role IDs
const ROLES = {
    RESONATOR: "1449492877712293901", // Initiate (Ascesis)
    ELDER: "1449492876470915216",     // Survivor (Heritage)
    SCARRED: "1449492874734604569"    // Stakeholder (Market)
};

client.on('ready', () => {
    console.log(`🌑 GritBot is manifesting as ${client.user?.tag}`);
});

/**
 * Fetches the GRIT token balance for a wallet
 */
async function getGritBalance(walletAddress: string): Promise<number> {
    try {
        const wallet = new PublicKey(walletAddress);
        const tokenAccount = await getAssociatedTokenAddress(GRIT_MINT, wallet);

        try {
            const accountInfo = await getAccount(connection, tokenAccount);
            return Number(accountInfo.amount); // Raw amount (decimals handled in logic if needed, usually 9)
        } catch (e: any) {
            if (e instanceof TokenAccountNotFoundError || e.name === 'TokenAccountNotFoundError') {
                return 0;
            }
            throw e;
        }
    } catch (e) {
        console.error("Error fetching GRIT balance:", e);
        return 0;
    }
}

/**
 * Syncs a user's On-Chain Ritual State to Discord Roles
 */
async function syncUserRitualState(guildId: string, userId: string, walletAddress: string) {
    try {
        const guild = await client.guilds.fetch(guildId);
        const member = await guild.members.fetch(userId);

        console.log(`Syncing ${member.user.tag} with wallet ${walletAddress}...`);

        // 1. Fetch GRIT Balance
        const gritRaw = await getGritBalance(walletAddress);
        const grit = gritRaw / 1_000_000_000; // Assuming 9 decimals
        console.log(`Balance: ${grit} GRIT`);

        // 2. Logic for Roles
        // INITIATE (Ascesis): Needs >= 100 GRIT
        if (grit >= 100) {
            const role = guild.roles.cache.get(ROLES.RESONATOR);
            if (role && !member.roles.cache.has(ROLES.RESONATOR)) {
                await member.roles.add(ROLES.RESONATOR);
                console.log(`✨ ${member.user.tag} granted INITIATE role.`);
            }
        }

        // SURVIVOR (Heritage): Ideally checks "Scars". For now, using High Balance Proxy or specific holding logic
        // Placeholder: Needs 500 GRIT
        if (grit >= 500) {
            const role = guild.roles.cache.get(ROLES.ELDER);
            if (role && !member.roles.cache.has(ROLES.ELDER)) {
                await member.roles.add(ROLES.ELDER);
                console.log(`✨ ${member.user.tag} granted SURVIVOR role.`);
            }
        }

        // STAKEHOLDER (Market): Ideally checks Staking Account. 
        // Placeholder: Needs 1000 GRIT (Whale status)
        if (grit >= 1000) {
            const role = guild.roles.cache.get(ROLES.SCARRED);
            if (role && !member.roles.cache.has(ROLES.SCARRED)) {
                await member.roles.add(ROLES.SCARRED);
                console.log(`🔥 ${member.user.tag} granted STAKEHOLDER role.`);
            }
        }

        return grit;

    } catch (error) {
        console.error("Sync failed:", error);
        throw error;
    }
}

/**
 * Emergency Protocol: Triggered when the Artist activates "Glitch Mode"
 */
export async function triggerGlitchMode(guildId: string) {
    try {
        const guild = await client.guilds.fetch(guildId);
        await guild.channels.create({
            name: `rupture-${Math.random().toString(16).substring(2, 6)}`,
            reason: 'Market Volatility Detected',
        });
        console.log("⚠️ GLITCH MODE ACTIVATED");
    } catch (e) {
        console.error("Glitch Mode Failed:", e);
    }
}

// --- SLASH COMMANDS ---

import fs from 'fs';
import path from 'path';
import { createCanvas, loadImage, registerFont } from 'canvas';

// ... (Existing Imports)

// --- GAMIFICATION STATE ---
const DATA_FILE = path.join(process.cwd(), 'data', 'discord_xp.json');
const USERS_FILE = path.join(process.cwd(), 'data', 'users.json');
const LINK_FILE = path.join(process.cwd(), 'data', 'discord_links.json');

interface UserXP {
    xp: number;
    level: number;
    lastMessage: number; // Timestamp for cooldown
}

let xpData: Record<string, UserXP> = {};
let usersData: Record<string, any> = {};
let discordWalletMap: Record<string, string> = {}; // DiscordID -> Wallet
const voiceJoinTimes = new Map<string, number>();

// Load Data
function loadData() {
    if (fs.existsSync(DATA_FILE)) xpData = JSON.parse(fs.readFileSync(DATA_FILE, 'utf-8'));
    if (fs.existsSync(USERS_FILE)) usersData = JSON.parse(fs.readFileSync(USERS_FILE, 'utf-8'));
    if (fs.existsSync(LINK_FILE)) discordWalletMap = JSON.parse(fs.readFileSync(LINK_FILE, 'utf-8'));

    // Ensure dirs
    const dir = path.dirname(DATA_FILE);
    if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
}

loadData();

function saveXP() {
    fs.writeFileSync(DATA_FILE, JSON.stringify(xpData, null, 2));
}

function saveUsers() {
    fs.writeFileSync(USERS_FILE, JSON.stringify(usersData, null, 2));
}

function saveLinks() {
    fs.writeFileSync(LINK_FILE, JSON.stringify(discordWalletMap, null, 2));
}

function addXP(userId: string, amount: number) {
    // 1. Local Discord XP (Legacy/Rank Card)
    if (!xpData[userId]) xpData[userId] = { xp: 0, level: 1, lastMessage: 0 };
    xpData[userId].xp += amount;

    // 2. Web Resonance (Unified Persistence)
    const wallet = discordWalletMap[userId];
    if (wallet) {
        if (!usersData[wallet]) usersData[wallet] = { wallet, resonance: 0, scars: [] };
        // Sync: Add amount to resonance
        usersData[wallet].resonance = (usersData[wallet].resonance || 0) + amount;
        saveUsers();
        console.log(`🔗 Synced ${amount} Resonance to wallet ${wallet.substring(0, 6)}...`);
    }

    // Level Up Calculation
    const nextLevel = xpData[userId].level * 1000;
    if (xpData[userId].xp >= nextLevel) {
        xpData[userId].level++;
        saveXP();
        return true; // Leveled Up
    }
    saveXP();
    return false;
}

// --- EVENTS ---

client.on('messageCreate', async (message) => {
    if (message.author.bot || !message.guild) return;

    const userId = message.author.id;
    const now = Date.now();

    if (!xpData[userId]) xpData[userId] = { xp: 0, level: 1, lastMessage: 0 };

    // Cooldown: 1 min constraint
    if (now - xpData[userId].lastMessage > 60000) {
        const xpGain = Math.floor(Math.random() * 10) + 10; // 10-20 XP
        const leveledUp = addXP(userId, xpGain);
        xpData[userId].lastMessage = now;

        if (leveledUp) {
            message.channel.send(`🌟 **Ascension.** ${message.author} has reached **Resonance Level ${xpData[userId].level}**.`);
        }
    }
});

client.on('voiceStateUpdate', (oldState, newState) => {
    const userId = newState.member?.id;
    if (!userId) return;

    // Joined Voice
    if (!oldState.channelId && newState.channelId) {
        voiceJoinTimes.set(userId, Date.now());
    }
    // Left Voice
    else if (oldState.channelId && !newState.channelId) {
        const joinTime = voiceJoinTimes.get(userId);
        if (joinTime) {
            const durationMinutes = (Date.now() - joinTime) / 60000;
            if (durationMinutes > 1) {
                const xpGain = Math.floor(durationMinutes * 5); // 5 XP per min
                addXP(userId, xpGain);
                console.log(`🎙️ ${newState.member?.user.tag} earned ${xpGain} XP for voice activity.`);
            }
            voiceJoinTimes.delete(userId);
        }
    }
});

// --- COMMANDS ---

client.on('interactionCreate', async interaction => {
    if (!interaction.isChatInputCommand()) return;

    // ... (Existing Commands: sacrifice, sync)
    if (interaction.commandName === 'sacrifice') { /* ... existing ... */
        // (Copied existing logic for context match)
        const baseUrl = process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000";
        const url = `${baseUrl}/domain/ascesis?user=${interaction.user.id}`;

        await interaction.reply({
            content: "🔴 **The Trial Awaits.** To increase your capacity, you must offer a part of your breath to the void.",
            components: [{
                type: 1,
                components: [{
                    type: 2,
                    style: 5,
                    label: "Enter the Pyre",
                    url: url
                }]
            }],
            ephemeral: true
        });
    }

    if (interaction.commandName === 'sync') { /* ... existing ... */
        const wallet = interaction.options.getString('wallet');
        if (wallet) {
            await interaction.deferReply({ ephemeral: true });
            try {
                const balance = await syncUserRitualState(interaction.guildId!, interaction.user.id, wallet);

                // LINK WALLET
                discordWalletMap[interaction.user.id] = wallet;
                saveLinks(); // Persist the link

                await interaction.editReply(`**Symbiosis Complete.**\nWallet: \`${wallet.substring(0, 6)}...${wallet.substring(wallet.length - 4)}\`\nDetected Balance: **${balance.toFixed(2)} GRIT**\n\n🔗 **Link Established**: Future chat activity will earn **Web Resonance**.`);
            } catch (e) {
                await interaction.editReply("❌ Sync Failed. Ensure your wallet address is correct and try again.");
            }
        } else {
            await interaction.reply({ content: "Please provide a wallet address.", ephemeral: true });
        }
    }

    // NEW COMMANDS
    if (interaction.commandName === 'leaderboard') {
        const sorted = Object.entries(xpData).sort(([, a], [, b]) => b.xp - a.xp).slice(0, 10);
        const embed = {
            title: "🏆 Resonance Leaderboard",
            description: sorted.map(([id, data], i) => `**${i + 1}.** <@${id}> - **lvl ${data.level}** (${data.xp} XP)`).join('\n') || "No data yet.",
            color: 0x00ff00
        };
        await interaction.reply({ embeds: [embed] });
    }

    if (interaction.commandName === 'rank') {
        const user = interaction.user;
        const data = xpData[user.id] || { xp: 0, level: 1 };

        await interaction.deferReply();

        try {
            const canvas = createCanvas(700, 250);
            const ctx = canvas.getContext('2d');

            // Background
            ctx.fillStyle = '#111';
            ctx.fillRect(0, 0, canvas.width, canvas.height);

            // Texture/Gradient
            const grd = ctx.createLinearGradient(0, 0, 700, 250);
            grd.addColorStop(0, '#1a1a1a');
            grd.addColorStop(1, '#000000');
            ctx.fillStyle = grd;
            ctx.fillRect(10, 10, 680, 230);

            // Text
            ctx.fillStyle = '#ffffff';
            ctx.font = 'bold 40px sans-serif';
            ctx.fillText(user.username, 30, 80);

            ctx.font = '30px sans-serif';
            ctx.fillStyle = '#00ff00';
            ctx.fillText(`Level ${data.level}`, 30, 130);

            ctx.fillStyle = '#888';
            ctx.font = '24px sans-serif';
            ctx.fillText(`Resonance: ${data.xp}`, 30, 170);

            // Progress Bar
            const nextLevel = data.level * 1000;
            const progress = data.xp / nextLevel;

            ctx.fillStyle = '#333';
            ctx.fillRect(30, 200, 640, 20);

            ctx.fillStyle = '#00ff00';
            ctx.fillRect(30, 200, 640 * Math.min(progress, 1), 20);

            const buffer = canvas.toBuffer();
            await interaction.editReply({ files: [{ attachment: buffer, name: 'rank.png' }] });
        } catch (e) {
            console.error(e);
            await interaction.editReply(`**${user.username}**\nLevel: ${data.level}\nXP: ${data.xp}`);
        }
    }
});

client.login(DISCORD_TOKEN);
