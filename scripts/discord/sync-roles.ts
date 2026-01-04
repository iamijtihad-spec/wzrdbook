
import { Client, Guild } from 'discord.js';
import artistConfig from '../../config/artist.config.json';

interface UserGritState {
    stakedAmount: number;
    burnCount: number;
    hasLinked: boolean;
}

export const updateUserRoles = async (client: Client, discordUserId: string, state: UserGritState) => {
    const guildId = artistConfig.social_architecture.discord_guild_id;
    const roleIds = artistConfig.social_architecture.roles;

    try {
        const guild = await client.guilds.fetch(guildId);
        if (!guild) return;

        const member = await guild.members.fetch(discordUserId);
        if (!member) return;

        // 1. RESONATOR (Linked)
        if (state.hasLinked) {
            await member.roles.add(roleIds.RESONATOR);
        }

        // 2. ELDER (Staked > 0 for now, logic can be stricter)
        if (state.stakedAmount > 0) {
            await member.roles.add(roleIds.ELDER);
        } else {
            // await member.roles.remove(roleIds.ELDER); // Optional: remove if criteria lost
        }

        // 3. SCARRED (Burned > 0)
        if (state.burnCount > 0) {
            await member.roles.add(roleIds.SCARRED);
        }

        console.log(`Updated roles for ${member.user.tag}`);

    } catch (error) {
        console.error("Failed to update user roles:", error);
    }
};
