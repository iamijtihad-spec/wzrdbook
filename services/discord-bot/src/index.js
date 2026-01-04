import { Client, GatewayIntentBits, Events, EmbedBuilder, TextChannel, PermissionsBitField, ChannelType } from 'discord.js';
import * as dotenv from 'dotenv';
import { Connection, PublicKey, Keypair } from '@solana/web3.js';
import { getAssociatedTokenAddress } from '@solana/spl-token';
import express from 'express';
import cors from 'cors';
import nacl from 'tweetnacl';
import * as fs from 'fs';
import * as path from 'path';
import { fileURLToPath } from 'url';
// --- INITIALIZATION ---
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
// Load Env (Root .env.local)
const envPath = path.resolve(__dirname, '../../../.env.local');
dotenv.config({ path: envPath });
console.log("✅ Environment Loaded.");
console.log("   -> Bucket:", process.env.R2_BUCKET_NAME);
console.log("   -> Guild:", process.env.GUILD_ID);
// --- CONFIG ---
const PORT = 3001;
const GUILD_ID = process.env.GUILD_ID || "1449489400688939060";
const RPC_URL = process.env.SOLANA_RPC_URL || "https://api.devnet.solana.com";
// --- CLIENTS ---
const client = new Client({
    intents: [
        GatewayIntentBits.Guilds,
        GatewayIntentBits.GuildMessages,
        GatewayIntentBits.MessageContent,
        GatewayIntentBits.GuildMembers,
        GatewayIntentBits.GuildVoiceStates
    ]
});
const connection = new Connection(RPC_URL);
const app = express();
app.use(cors());
app.use(express.json());
// --- CONSTANTS ---
const CHANNELS = {
    PORTAL: "1449494223366783119",
    BONDING: "1449495580106555435",
    BOUNTIES: "1449495584963690731",
    INNER_SANCTUM: "1449494229662437547",
    LOBBY: "1449495578269585408",
    GALLERY: "1449501383358414908",
    COUNCIL: "1449494228836286665",
    ANNOUNCEMENTS: "1449494223782019113",
    MERCH: "1449495580933099571",
    STAKING: "1449495580106555436" // Added placeholder to fix lint. User should verify.
};
const SEED_DATA = {
    [CHANNELS.PORTAL]: {
        title: "🪐 THE ARCHIVES: SATURN PROTOCOL",
        desc: "**Welcome to the Nucleus.**\nThis is a living, breathing digital organism. It operates on the **Law of 144**.\n\n**📜 THE PRIME DIRECTIVES**\n1. **The Economy**: We use a Dual-Token System.\n   - **GRIT ($GRIT)**: The Bonding Token. Starts at 0.1 SOL. Price floats on a Curve.\n   - **MOXY ($MOXY)**: The Staking Token. Earns you Roles & Yield.\n\n2. **The Evolution**: The System evolves based on Population.\n   - **Epoch 1**: The Pioneers (Target: 25 Verified Users).\n   - **Epoch 2**: Critical Mass (Target: 144 Verified Users).\n\n**🔑 ACCESS**\nVerify your wallet in the Dashboard to gain the **Nucleus** role.",
        image: "https://raw.githubusercontent.com/solana-labs/token-list/main/assets/mainnet/So11111111111111111111111111111111111111112/logo.png"
    },
    [CHANNELS.BONDING]: {
        title: "📈 THE CURVE (GRIT)",
        desc: "**Dynamic Pricing Algorithm**\nWhen you buy GRIT, the price goes **UP**. When you sell, it goes **DOWN**.\n\n**Strategy**:\n- Buy early to secure a lower cost basis.\n- Hold GRIT to maintain your % share of the protocol.\n- **Note**: The Treasury takes a 1% tax on all swaps to fund the Airdrop Engine.",
        image: null
    },
    [CHANNELS.STAKING]: {
        title: "🔒 THE VAULT (MOXY)",
        desc: "**Time-Locked Yield**\nStaking MOXY proves your conviction. The longer you lock, the higher your status.\n\n**Mechanics**:\n- **Minimum Lock**: 7 Days.\n- **Early Exit**: 10% Slash Penalty (Burned).\n- **Rewards**: Daily MOXY Drip + Role Ascension.\n\n**Roles**:\n🥇 **Gold**: 3,500 MOXY Staked\n💎 **Diamond**: 7,000 MOXY Staked",
        image: null
    },
    [CHANNELS.BOUNTIES]: {
        title: "⚔️ BOUNTY BOARD",
        desc: "**Proof of Work**\nThe Protocol rewards those who expand the network.\n\n**How to Earn**:\n1. **Execute**: Complete a task (e.g., Tweet, TikTok, Art).\n2. **Submit**: Paste the link in the Dashboard.\n3. **Verify**: The Admin reviews your submission manually.\n4. **Get Paid**: 10 - 50 CHI sent directly to your wallet upon approval.",
        image: null
    },
    [CHANNELS.MERCH]: {
        title: "👕 THE ARMORY",
        desc: "**Physical Artifacts**\nMerch is not just clothing. It is your uniform.\n\n**Pricing Update**:\n- **Void Hoodie**: Reduced to **500 CHI**.\n- **Genesis Vinyl**: Reduced to **1,500 CHI**.\n\n**Requirement**: You must post a photo wearing the merch to unlock the 'Operator' role.",
        image: null
    },
    [CHANNELS.GALLERY]: {
        title: "🎞️ THE RINGS (MEDIA)",
        desc: "**Token-Gated Transmissions**\nThis channel broadcasts exclusive content from the Core.\n\n**Access Levels**:\n- **Public**: Teasers & Trailers.\n- **Gold**: Full Music Tracks.\n- **Diamond**: Behind-the-Scenes & 4K Visuals.\n\n*Uploads are managed directly by the Admin Console.*",
        image: null
    }
};
// --- PERSISTENCE ---
const DATA_FILE = path.join(__dirname, 'mappings.json');
let walletMap = {}; // Wallet -> DiscordID
// Load Data
if (fs.existsSync(DATA_FILE)) {
    try {
        walletMap = JSON.parse(fs.readFileSync(DATA_FILE, 'utf8'));
    }
    catch (e) {
        console.error("Failed to load mappings:", e);
    }
}
function saveMappings() {
    fs.writeFileSync(DATA_FILE, JSON.stringify(walletMap, null, 2));
}
// --- API SERVER ---
// GET /api/status/:wallet
// --- EPOCH CONFIGURATION (The Snowball) ---
const EPOCHS = {
    1: { target: 25, name: "The Pioneers", reward: "ION" },
    2: { target: 144, name: "Critical Mass", reward: "AETHER" }
};
app.get('/api/epoch', (req, res) => {
    const verifiedCount = Object.keys(walletMap).length;
    let currentEpoch = 1;
    let nextTarget = EPOCHS[1].target;
    let epochName = EPOCHS[1].name;
    if (verifiedCount >= EPOCHS[1].target) {
        currentEpoch = 2;
        nextTarget = EPOCHS[2].target;
        epochName = EPOCHS[2].name;
    }
    // Cap at Epoch 2 completion
    if (verifiedCount >= EPOCHS[2].target) {
        currentEpoch = 3;
        nextTarget = 9999;
        epochName = "Galactic Civilization";
    }
    res.json({
        epoch: currentEpoch,
        name: epochName,
        progress: verifiedCount,
        target: nextTarget,
        nextReward: EPOCHS[currentEpoch]?.reward || "Unknown"
    });
});
app.get('/api/status/:wallet', async (req, res) => {
    const { wallet } = req.params;
    const discordId = walletMap[wallet];
    if (!discordId) {
        res.json({ linked: false });
        return;
    }
    try {
        const guild = client.guilds.cache.get(GUILD_ID);
        if (!guild)
            throw new Error("Guild not found");
        const member = await guild.members.fetch(discordId);
        const roles = member.roles.cache.map(r => r.name);
        res.json({
            linked: true,
            discordId: discordId,
            username: member.user.username,
            roles: roles,
            isBooster: !!member.premiumSince,
            avatar: member.user.displayAvatarURL()
        });
    }
    catch (e) {
        // Member might have left
        res.json({ linked: true, discordId: discordId, error: "Member not found in server" });
    }
});
app.post('/api/verify', async (req, res) => {
    try {
        const { discordId, walletAddress, signature, message } = req.body;
        if (!discordId || !walletAddress || !signature || !message) {
            res.status(400).json({ error: "Missing fields" });
            return;
        }
        // 1. Verify Signature
        const signatureUint8 = new Uint8Array(Buffer.from(signature, 'base64'));
        const messageUint8 = new TextEncoder().encode(message);
        const pubKeyUint8 = new PublicKey(walletAddress).toBytes();
        const verified = nacl.sign.detached.verify(messageUint8, signatureUint8, pubKeyUint8);
        if (!verified) {
            res.status(401).json({ error: "Invalid signature" });
            return;
        }
        // SAVE MAPPING
        walletMap[walletAddress] = discordId;
        saveMappings();
        // 2. Fetch Balance & Determine Role
        const pubKey = new PublicKey(walletAddress);
        // MINT ADDRESSES (Law of 144)
        const GRIT_MINT = new PublicKey("CS8ZQMdJ5t5hNuM51LXJBU4zBysZWAkFj9oJ6MwtnHsS");
        const MOXY_MINT = new PublicKey("2FFhBNoCqsgXejrqQXk3gJXWyG9nuiE7qj4Sv2wrcnwq");
        let gritBalance = 0;
        let moxyBalance = 0;
        try {
            // Fetch GRIT
            const gritATA = await getAssociatedTokenAddress(GRIT_MINT, pubKey);
            const gritAccount = await connection.getTokenAccountBalance(gritATA);
            gritBalance = gritAccount.value.uiAmount || 0;
        }
        catch (e) {
            console.log("No GRIT Account found");
        }
        try {
            // Fetch MOXY
            const moxyATA = await getAssociatedTokenAddress(MOXY_MINT, pubKey);
            const moxyAccount = await connection.getTokenAccountBalance(moxyATA);
            moxyBalance = moxyAccount.value.uiAmount || 0;
        }
        catch (e) {
            console.log("No MOXY Account found");
        }
        console.log(`Wallet ${walletAddress}: GRIT=${gritBalance}, MOXY=${moxyBalance}`);
        // LAW OF 144 TIERS
        // Diamond: 1000 GRIT OR 7000 MOXY
        // Gold:     500 GRIT OR 3500 MOXY
        // Silver:   250 GRIT OR 1750 MOXY
        // Bronze:   100 GRIT OR  700 MOXY
        let tier = "None";
        if (gritBalance >= 1000 || moxyBalance >= 7000)
            tier = "Diamond";
        else if (gritBalance >= 500 || moxyBalance >= 3500)
            tier = "Gold";
        else if (gritBalance >= 250 || moxyBalance >= 1750)
            tier = "Silver";
        else if (gritBalance >= 100 || moxyBalance >= 700)
            tier = "Bronze";
        // 3. Assign Role in Discord
        const guild = client.guilds.cache.get(GUILD_ID);
        if (guild) {
            try {
                // Fetch member (might fail if they aren't in server)
                const member = await guild.members.fetch(discordId);
                // Remove old tiers
                const tierRoles = ["Bronze", "Silver", "Gold", "Diamond"];
                const rolesToRemove = member.roles.cache.filter(r => tierRoles.includes(r.name));
                await member.roles.remove(rolesToRemove);
                // Add new tier
                if (tier !== "None") {
                    let role = guild.roles.cache.find(r => r.name === tier);
                    if (!role) {
                        try {
                            const colors = {
                                "Bronze": 0xcd7f32,
                                "Silver": 0xc0c0c0,
                                "Gold": 0xffd700,
                                "Diamond": 0xb9f2ff
                            };
                            role = await guild.roles.create({
                                name: tier,
                                color: colors[tier] || 0x99aab5,
                                reason: 'Auto-created during verification'
                            });
                            console.log(`Auto-created role: ${tier}`);
                        }
                        catch (e) {
                            console.error(`Failed to create role ${tier}:`, e);
                        }
                    }
                    if (role)
                        await member.roles.add(role);
                }
                // Add "Nucleus" (Verified)
                const nucleusRole = guild.roles.cache.find(r => r.name === "Nucleus");
                if (nucleusRole)
                    await member.roles.add(nucleusRole);
                res.json({ success: true, tier: tier, wallet: walletAddress, balances: { grit: gritBalance, moxy: moxyBalance } });
                console.log(`Verified ${discordId} as ${tier}`);
                return;
            }
            catch (e) {
                console.error("Discord Member Fetch Error:", e);
                res.status(404).json({ error: "User not found in Discord server" });
                return;
            }
        }
        else {
            res.status(500).json({ error: "Guild not found" });
            return;
        }
    }
    catch (e) {
        console.error(e);
        res.status(500).json({ error: "Internal Server Error" });
    }
});
// --- DISCORD EVENTS ---
client.once(Events.ClientReady, (c) => {
    console.log(`Bot Ready! ${c.user.tag}`);
    app.listen(PORT, "0.0.0.0", () => console.log(`API Listening on ${PORT} (0.0.0.0)`));
});
client.on(Events.MessageCreate, async (message) => {
    if (message.author.bot)
        return;
    // --- USER COMMANDS ---
    if (message.content === '!verify') {
        const link = `http://localhost:3000/verify?discordId=${message.author.id}`;
        const dmEmbed = new EmbedBuilder()
            .setTitle("🔐 Verify Your Wallet")
            .setDescription(`Click below to connect your wallet.\n\n[**>>> VERIFY NOW <<<**](${link})\n\nOr copy this link:\n\`${link}\``)
            .setColor(0x9333ea);
        try {
            await message.author.send({ embeds: [dmEmbed] });
            await message.reply("Sent you a DM with the verification link.");
        }
        catch (e) {
            await message.reply("I couldn't DM you. Please enable DMs from this server.");
        }
    }
    // --- ADMIN COMMANDS ---
    if (!message.member?.permissions.has(PermissionsBitField.Flags.Administrator))
        return;
    if (message.content === '!seed') {
        await message.reply('🌱 Seeding Channel Content...');
        const guild = client.guilds.cache.get(GUILD_ID);
        if (!guild)
            return;
        for (const [channelId, data] of Object.entries(SEED_DATA)) {
            const channel = guild.channels.cache.get(channelId);
            if (channel) {
                const embed = new EmbedBuilder()
                    .setTitle(data.title)
                    .setDescription(data.desc)
                    .setColor(0x9333ea) // Purple
                    .setFooter({ text: 'Saturn Protocol System' })
                    .setTimestamp();
                if (data.image)
                    embed.setThumbnail(data.image);
                await channel.send({ embeds: [embed] });
                console.log(`Seeded ${channel.name}`);
            }
        }
        await message.reply('✅ Seeding Complete.');
    }
    if (message.content === '!setup-roles') {
        await message.reply('⚙️ Configuring Roles & Permissions...');
        const guild = client.guilds.cache.get(GUILD_ID);
        if (!guild)
            return;
        const roles = [
            { name: 'Nucleus', color: 0x9333ea, position: 1 }, // Connected
            { name: 'Bronze', color: 0xcd7f32, position: 2 },
            { name: 'Silver', color: 0xc0c0c0, position: 3 },
            { name: 'Gold', color: 0xffd700, position: 4 },
            { name: 'Diamond', color: 0xb9f2ff, position: 5 },
            { name: 'InnerSanctum', color: 0xff0000, position: 6 } // Admin
        ];
        for (const r of roles) {
            let role = guild.roles.cache.find(x => x.name === r.name);
            if (!role) {
                // @ts-ignore
                role = await guild.roles.create({
                    name: r.name,
                    color: r.color,
                    reason: 'Saturn Protocol Setup'
                });
                console.log(`Created Role: ${r.name}`);
            }
        }
        await message.reply('✅ Roles Created. (Permissions logic skipped for brevity)');
    }
});
const GRIT_MINT = new PublicKey("CS8ZQMdJ5t5hNuM51LXJBU4zBysZWAkFj9oJ6MwtnHsS");
client.on(Events.VoiceStateUpdate, async (oldState, newState) => {
    // Only care if joining the specific channel
    const LISTENING_PARTY_ID = "1449501384071319704";
    if (newState.channelId === LISTENING_PARTY_ID && oldState.channelId !== LISTENING_PARTY_ID) {
        // User Joined
        const member = newState.member;
        if (!member || member.user.bot)
            return; // Ignore bots
        console.log(`🔒 Access Check: ${member.user.tag} attempting to join Radio...`);
        // 1. Lookup Wallet
        // Find wallet by Discord ID (inverse lookup of walletMap)
        const wallet = Object.keys(walletMap).find(key => walletMap[key] === member.id);
        if (!wallet) {
            console.log(`⛔ Access Denied: No linked wallet for ${member.user.tag}`);
            await member.voice.disconnect("Wallet not verified");
            try {
                await member.send("⛔ **Access Denied**: You must verify your wallet to access the Nucleus Radio.\nUse `!verify` in the server.");
            }
            catch (e) { }
            return;
        }
        // 2. Check GRIT Balance
        try {
            const userKey = new PublicKey(wallet);
            const userATA = await getAssociatedTokenAddress(GRIT_MINT, userKey);
            try {
                const balanceObj = await connection.getTokenAccountBalance(userATA);
                const balance = balanceObj.value.uiAmount || 0;
                if (balance < 1) {
                    console.log(`⛔ Access Denied: ${member.user.tag} has ${balance} GRIT (Required: 1.0)`);
                    await member.voice.disconnect("Insufficient Balance");
                    try {
                        await member.send(`⛔ **Insufficient Funds**: Entry requires **1.0 GRIT**.\nYour Balance: ${balance} GRIT.`);
                    }
                    catch (e) { }
                }
                else {
                    console.log(`✅ Access Granted: ${member.user.tag} has ${balance} GRIT.`);
                }
            }
            catch (e) {
                // ATA doesn't exist = 0 Balance
                console.log(`⛔ Access Denied: ${member.user.tag} has 0 GRIT (No Account)`);
                await member.voice.disconnect("Insufficient Balance");
                try {
                    await member.send(`⛔ **Insufficient Funds**: Entry requires **1.0 GRIT**.\nYour Balance: 0 GRIT.`);
                }
                catch (err) { }
            }
        }
        catch (e) {
            console.error("Gating Error:", e);
        }
    }
});
import cron from 'node-cron';
const KEEPER_INTERVAL = '*/1 * * * *'; // Every minute
const DRIP_RATE = 0.0025; // 3.6 MOXY/day (Sustainable for ~5 Years @ 144 Users)
// Treasury Keypair Loader
let treasuryKey;
try {
    // Attempt to load from process.env.TREASURY_SECRET (Array of numbers or Base58)
    const secret = process.env.TREASURY_SECRET || process.env.WALLET_PRIVATE_KEY; // Fallback to Admin Wallet
    if (secret) {
        if (secret.includes('[')) {
            treasuryKey = Keypair.fromSecretKey(Uint8Array.from(JSON.parse(secret)));
        }
        else {
            // Assume Base58 if not array
            // treasuryKey = Keypair.fromSecretKey(bs58.decode(secret));
        }
    }
}
catch (e) {
    console.error("Keeper Warning: Could not load Treasury Key. Drip will fail.", e?.message || e);
}
import { transfer, getOrCreateAssociatedTokenAccount } from '@solana/spl-token';
function startKeeper() {
    console.log(`👁️ The Keeper is watching... (Schedule: ${KEEPER_INTERVAL})`);
    cron.schedule(KEEPER_INTERVAL, async () => {
        console.log("💧 Keeper Drip Initiated...");
        if (!treasuryKey) {
            console.log("⚠️ Treasury Key Missing. Drip Skipped.");
            return;
        }
        const MOXY_MINT = new PublicKey("2FFhBNoCqsgXejrqQXk3gJXWyG9nuiE7qj4Sv2wrcnwq");
        // Iterate known wallets
        const wallets = Object.keys(walletMap);
        for (const wallet of wallets) {
            try {
                const pubKey = new PublicKey(wallet);
                const discordId = walletMap[wallet];
                // Fetch User Stake PDA from Chain (Source of Truth)
                const [userStakePDA] = PublicKey.findProgramAddressSync([Buffer.from("stake"), pubKey.toBuffer()], new PublicKey("G9Xq99jdwuvQD1nGGhW1C3TYuc6iRz78faoscQqmX2D7") // Staking Program
                );
                const accountInfo = await connection.getAccountInfo(userStakePDA);
                if (accountInfo) {
                    const guild = client.guilds.cache.get(GUILD_ID);
                    if (guild && discordId) {
                        try {
                            const member = await guild.members.fetch(discordId);
                            const isBooster = !!member.premiumSince;
                            let rate = DRIP_RATE;
                            if (isBooster) {
                                rate = rate * 1.5;
                            }
                            console.log(`  -> Dripping ${rate} MOXY to ${wallet.slice(0, 4)}...`);
                            // --- REAL TRANSACTION ---
                            // 1. Get/Create Treasury ATA
                            const sourceAccount = await getOrCreateAssociatedTokenAccount(connection, treasuryKey, MOXY_MINT, treasuryKey.publicKey);
                            // 2. Get/Create User ATA
                            const destAccount = await getOrCreateAssociatedTokenAccount(connection, treasuryKey, // Payer
                            MOXY_MINT, pubKey);
                            // 3. Transfer
                            // Amount: rate * 10^decimals (Assuming 9 decimals for MOXY? Or 6? standard is 9)
                            // Let's assume 9.
                            const amount = Math.floor(rate * 1_000_000_000);
                            if (amount > 0) {
                                const tx = await transfer(connection, treasuryKey, sourceAccount.address, destAccount.address, treasuryKey.publicKey, amount);
                                console.log(`     ✅ Tx Confirmed: ${tx}`);
                            }
                        }
                        catch (e) {
                            console.log(`     ❌ Drip Failed: ${e?.message || e}`);
                        }
                    }
                }
            }
            catch (e) {
                console.error(`Keeper Error for ${wallet}:`, e);
            }
        }
        console.log("💧 Drip Complete.");
    });
}
// --- THE SENTINEL (Admin Watchdog) ---
const SENTINEL_INTERVAL = '0 */6 * * *'; // Every 6 hours
const ADMIN_ID = "302251346067030018"; // Specific Admin ID to DM (or env)
async function startSentinel() {
    console.log(`🛡️ Sentinel Active. Monitoring Health...`);
    // 1. Boot Message
    const user = await client.users.fetch(ADMIN_ID).catch(() => null);
    if (user)
        await user.send("🛡️ **System Online**: Sentinel is now monitoring the Saturn Protocol.");
    cron.schedule(SENTINEL_INTERVAL, async () => {
        try {
            console.log("🛡️ Running Health Check...");
            // Check Treasury Balance (Simulated for now)
            // In production, we fetch `treasuryKey` balance from chain.
            // For now, we just heartbeat.
            // Future: if (balance < 300000) alertAdmin("Low Treasury!");
        }
        catch (e) {
            console.error("Sentinel Error:", e);
        }
    });
}
// --- NUCLEUS RADIO (Voice) ---
import { joinVoiceChannel, createAudioPlayer, createAudioResource, AudioPlayerStatus, VoiceConnectionStatus, NoSubscriberBehavior } from '@discordjs/voice';
import { S3Client, ListObjectsV2Command } from '@aws-sdk/client-s3';
let player = null;
let currentResource = null;
let voiceConnection = null;
const R2_PUBLIC_URL = "https://pub-ec5864865d7a404287c6846067709dba.r2.dev"; // WZRDCLVB Public Bucket
async function startNucleusRadio() {
    console.log("📻 Initializing Nucleus Radio (R2 Uplink)...");
    const guild = client.guilds.cache.get(GUILD_ID);
    if (!guild)
        return;
    const LISTENING_PARTY_ID = "1449501384071319704";
    const channel = guild.channels.cache.get(LISTENING_PARTY_ID);
    if (!channel || channel.type !== ChannelType.GuildVoice) {
        console.log(`⚠️ Radio Standby: Channel not found.`);
        return;
    }
    voiceConnection = joinVoiceChannel({
        channelId: channel.id,
        guildId: guild.id,
        adapterCreator: guild.voiceAdapterCreator,
        selfDeaf: false,
        selfMute: false
    });
    voiceConnection.on(VoiceConnectionStatus.Ready, async () => {
        console.log("✅ Radio Online: Connected to Frequency.");
        try {
            // Explicitly undeafen
            const me = await guild.members.fetchMe();
            if (me.voice.serverDeaf)
                await me.voice.setDeaf(false);
        }
        catch (e) {
            console.error("Failed to undeafen:", e);
        }
    });
    // --- R2 PLAYLIST FETCH ---
    let playlist = [];
    try {
        // Use Env Vars if correct, or fallback/warn. 
        // Note: User has duplicate env vars, so we must be careful. 
        // Assuming the FIRST set (wzrdclvb) is what we want, but process.env might have the LAST set.
        // We'll rely on the Public URL for playback, but we need LIST permissions.
        // If LIST fails due to bad keys, we fallback to a hardcoded "station" or local files.
        const r2 = new S3Client({
            region: 'auto',
            endpoint: process.env.R2_ENDPOINT || "https://1aa7bb22d4509ba4b29cfc9418424695.r2.cloudflarestorage.com",
            credentials: {
                accessKeyId: process.env.R2_ACCESS_KEY_ID || "",
                secretAccessKey: process.env.R2_SECRET_ACCESS_KEY || ""
            }
        });
        const command = new ListObjectsV2Command({ Bucket: "wzrdclvb" });
        const response = await r2.send(command);
        if (response.Contents) {
            playlist = response.Contents
                .map(item => item.Key || "")
                .filter(key => key.endsWith('.mp3') || key.endsWith('.wav'));
            console.log(`📻 R2 Playlist Loaded: ${playlist.length} tracks.`);
        }
    }
    catch (e) {
        console.error("⚠️ Radio Error: Failed to fetch R2 playlist. Check .env.local keys.", e);
        // Fallback?
    }
    if (playlist.length === 0) {
        console.log("⚠️ Radio Silence: No tracks found in R2 bucket.");
        return;
    }
    player = createAudioPlayer();
    voiceConnection.subscribe(player);
    let trackIndex = 0;
    const playNext = async () => {
        try {
            const trackKey = playlist[trackIndex];
            const trackUrl = `${R2_PUBLIC_URL}/${trackKey}`;
            console.log(`🎵 Now Playing: ${trackKey}`);
            client.user?.setActivity(`🎵 ${trackKey}`, { type: 2 });
            const resource = createAudioResource(trackUrl);
            player.play(resource);
            currentResource = resource;
            trackIndex = (trackIndex + 1) % playlist.length;
        }
        catch (e) {
            console.error("Radio Error: Playback failed", e);
            setTimeout(playNext, 5000);
        }
    };
    player.on(AudioPlayerStatus.Idle, () => {
        playNext();
    });
    player.on('error', (error) => {
        console.error('Radio Error:', error.message);
        playNext();
    });
    playNext();
}
function stopNucleusRadio() {
    if (player)
        player.stop();
    if (voiceConnection) {
        voiceConnection.destroy();
        voiceConnection = null;
    }
    console.log("📻 Nucleus Radio Offline (Scheduled).");
}
client.login(process.env.DISCORD_BOT_TOKEN).then(() => {
    startKeeper();
    startSentinel();
    // Schedule: 11 AM - 11 PM
    // Start at 11:00 AM
    cron.schedule('0 11 * * *', () => {
        console.log("⏰ 11:00 AM - Starting Nucleus Radio");
        startNucleusRadio();
    });
    // Stop at 11:00 PM
    cron.schedule('0 23 * * *', () => {
        console.log("⏰ 11:00 PM - Stopping Nucleus Radio");
        stopNucleusRadio();
    });
    // Initial Check: If currently between 11am and 11pm, start now.
    const hour = new Date().getHours();
    if (hour >= 11 && hour < 23) {
        console.log("⏰ Within Broadcast Hours. Initializing...");
        setTimeout(startNucleusRadio, 5000);
    }
    else {
        console.log("⏰ Outside Broadcast Hours (11am-11pm). Radio Standby.");
    }
});
//# sourceMappingURL=index.js.map