const { channels } = require("../config.json");

module.exports = (client, member) => {
  client.channels.cache
    .get(channels.stats.member)
    .setName(`Mitglieder: ${member.guild.members.cache.filter((m) => !m.user.bot).size}`);
  client.channels.cache
    .get(channels.stats.bots)
    .setName(`Bots: ${member.guild.members.cache.filter((m) => m.user.bot).size}`);
};
