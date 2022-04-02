import { GuildMember } from 'discord.js';
import { channels } from '../config.json';

export default (member: GuildMember) => {
  member.guild.channels.cache
    .get(channels.stats.member)
    ?.setName(`Mitglieder: ${member.guild.members.cache.filter((m) => !m.user.bot).size}`);

  member.guild.channels.cache
    .get(channels.stats.bots)
    ?.setName(`Bots: ${member.guild.members.cache.filter((m) => m.user.bot).size}`);
};
