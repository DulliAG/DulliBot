const { roles, channels } = require("./config.json");
const firstMessage = require("./first-message");
const { User, Guild } = require("discord.js");

module.exports = (client) => {
  const getEmoji = (emojiName) => client.emojis.cache.find((emoji) => emoji.name === emojiName);

  const emojis = {
    minecraft: "Minecraft",
    eft: "Escape From Tarkov",
    rlrpg: "ReallifeRPG",
  };

  const reactions = [];

  let emojiText = "```diff\n+ Wähle deine Rollen aus!```\n";
  for (const key in emojis) {
    const emoji = getEmoji(key);
    reactions.push(emoji);

    const role = emojis[key];
    emojiText += `${emoji} ${role}\n`;
  }

  firstMessage(client, channels.roles, emojiText, reactions);

  const handleReaction = (reaction, member, add) => {
    // Check if the reaction is made by an actual member
    if (member.id !== "669622328325570571") {
      const emoji = reaction._emoji.name;
      const { guild } = reaction.message;
      const mem = guild.members.cache.find((mem) => mem.id === member.id);
      if (add) {
        switch (emoji) {
          case "minecraft":
            mem.roles.add(roles.minecraft);
            break;
          case "eft":
            mem.roles.add(roles.eft);
            break;
          case "rlrpg":
            mem.roles.add(roles.realliferpg);
            break;
        }
      } else {
        switch (emoji) {
          case "minecraft":
            mem.roles.remove(roles.minecraft);
            break;
          case "eft":
            mem.roles.remove(roles.eft);
            break;
          case "rlrpg":
            mem.roles.remove(roles.realliferpg);
            break;
        }
      }
    }
  };

  client.on("messageReactionAdd", (reaction, member) => {
    if (reaction.message.channel.id == channels.roles) {
      handleReaction(reaction, member, true);
    }
  });

  client.on("messageReactionRemove", (reaction, member) => {
    if (reaction.message.channel.id == channels.roles) {
      handleReaction(reaction, member, false);
    }
  });
};
