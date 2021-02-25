const Discord = require("discord.js");
const { channels } = require("../config.json");

module.exports = (client, action, actionByMemberId, errorMessage) => {
  const msg = new Discord.MessageEmbed()
    .setColor("#fd0061")
    .setTitle("Fehlermeldung")
    .addFields(
      {
        name: "Durchgeführte Aktion",
        value: action,
        inline: true,
      },
      {
        name: "Durchgeführt durch",
        value: `<@${actionByMemberId}>`,
        inline: true,
      },
      {
        name: "Fehlermeldung",
        value: errorMessage,
      }
    )
    .setTimestamp()
    .setFooter("by DulliBot", "https://files.dulliag.de/web/images/logo.jpg");
  client.channels.cache.get(channels.logs).send(msg);
};
