/**
 * Credits goes to Worn Off Keys
 * https://www.youtube.com/watch?v=bJwPYCy17G4
 */
const { channels, rbr } = require("../config.json");
const firstMessage = require("./first-message");

module.exports = (client, botId) => {
  const getEmoji = (emojiName) => client.emojis.cache.find((emoji) => emoji.name === emojiName);

  let emojis = {};
  rbr.reactions.map((reaction) => {
    emojis[reaction.emoji] = reaction.name;
  });

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
    if (member.id !== botId) {
      console.log("REACTION", member);
      const emoji = reaction._emoji.name;
      const { guild } = reaction.message;
      const mem = guild.members.cache.find((mem) => mem.id === member.id);
      if (add) {
        const match = rbr.reactions.filter((reaction) => reaction.emoji === emoji)[0];
        mem.roles.add(match.id);
      } else {
        const match = rbr.reactions.filter((reaction) => reaction.emoji === emoji)[0];
        mem.roles.remove(match.id);
      }
    }
  };

  client.on("messageReactionAdd", (reaction, member) => {
    if (reaction.message.channel.id == channels.roles && !member.bot) {
      handleReaction(reaction, member, true);
    }
  });

  client.on("messageReactionRemove", (reaction, member) => {
    if (reaction.message.channel.id == channels.roles && !member.bot) {
      handleReaction(reaction, member, false);
    }
  });
};
