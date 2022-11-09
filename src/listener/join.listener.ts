import { Client } from 'discord.js';
import serverStats from '../core/server-stats';

export default (client: Client) => {
  client.on('guildMemberAdd', (member) => {
    serverStats(member.guild);
  });
};
