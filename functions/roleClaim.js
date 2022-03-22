/**
 * Credits goes to Worn Off Keys
 * https://www.youtube.com/watch?v=bJwPYCy17G4
 */
const Discord = require('discord.js');
const { channels, roles_by_reaction } = require('../config.json');

/**
 * @param {Discord.Message} message
 * @param {string{}} reactions
 * @returns {void}
 */
const addReaction = (message, reactions) => {
  message.react(reactions[0]);
  reactions.shift(); // remove item from current list
  if (reactions.length > 0) {
    setTimeout(() => addReaction(message, reactions), 750);
  }
};

/**
 *
 * @param {Discord.Client} client
 * @param {string} channelId
 * @param {string} text
 * @param {string[]} reactions
 * @returns {Promise<void>}
 */
const firstMessage = async (client, channelId, text, reactions = []) => {
  const channel = await client.channels.fetch(channelId);

  channel.messages.fetch().then((messages) => {
    // Check if there was already send an message to react
    // If not the bot will send a message for the users to react
    // If there is already an message the bot will listen for reactions on the first message and automaticlly adding missing roles
    if (messages.size === 0) {
      channel.send(text).then((message) => {
        addReaction(message, reactions);
      });
    } else {
      // If there already is an message the user will
      for (const message of messages) {
        message[1].edit(text);
        addReaction(message[1], reactions);
      }
    }
  });
};

/**
 * @param {Discord.Client} client
 * @returns {void}
 */
module.exports = (client) => {
  const getCustomEmoji = (emojiName) =>
    client.emojis.cache.find((emoji) => emoji.name === emojiName);
  const reactions = [];
  var emojis = roles_by_reaction.reactions,
    messageText = '```diff\n+ Wähle deine Rollen aus!```\n';

  emojis.forEach((emoji) => {
    const customEmoji = getCustomEmoji(emoji.emoji);
    reactions.push(customEmoji);

    const roleName = emoji.name;
    messageText += `${customEmoji} ${roleName}\n`;
  });

  firstMessage(client, channels.roles, messageText, reactions);

  /**
   * @param {*} reaction
   * @param {Discord.GuildMember} member
   * @param {boolean} add
   * @returns {void}
   */
  const handleReaction = (reaction, member, add) => {
    // Check if the message interaction was triggered by an an actual user and not by an registered bot
    if (member.id === client.user.id) return;

    const emoji = reaction._emoji.name;
    const { guild } = reaction.message;
    const mem = guild.members.cache.find((mem) => mem.id === member.id);
    if (add) {
      const match = roles_by_reaction.reactions.filter((reaction) => reaction.emoji === emoji)[0];
      mem.roles.add(match.id);
    } else {
      const match = roles_by_reaction.reactions.filter((reaction) => reaction.emoji === emoji)[0];
      mem.roles.remove(match.id);
    }
  };

  client.on('messageReactionAdd', (reaction, member) => {
    if (reaction.message.channel.id == channels.roles && !member.bot) {
      handleReaction(reaction, member, true);
    }
  });

  client.on('messageReactionRemove', (reaction, member) => {
    if (reaction.message.channel.id == channels.roles && !member.bot) {
      handleReaction(reaction, member, false);
    }
  });
};
