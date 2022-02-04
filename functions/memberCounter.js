const Discord = require('discord.js');
const { channels } = require('../config.json');

/**
 * @param {Discord.Client} client
 * @param {Discord.GuildMember} member
 * @returns {void}
 */
module.exports = (client, member) => {
  client.channels.cache
    .get(channels.stats.member)
    .setName(`Mitglieder: ${member.guild.members.cache.filter((m) => !m.user.bot).size}`);
  client.channels.cache
    .get(channels.stats.bots)
    .setName(`Bots: ${member.guild.members.cache.filter((m) => m.user.bot).size}`);
};
