import { Guild } from 'discord.js';
import { channels } from '../config.json';

export default (guild: Guild) => {
  guild.channels.cache
    .get(channels.stats.member)
    ?.setName(`Mitglieder: ${guild.members.cache.filter((m) => !m.user.bot).size}`);

  guild.channels.cache
    .get(channels.stats.bots)
    ?.setName(`Bots: ${guild.members.cache.filter((m) => m.user.bot).size}`);
};
