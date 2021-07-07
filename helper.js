const Discord = require("discord.js");
const { logs, commands } = require("./config.json");

const today = new Date();

/**
 * @param {string} message
 */
const createLog = (message) => {
  console.log(`[LOG:${today.toISOString()}] ${message}`);
};

/**
 * @param {string} message
 */
const createError = (message) => {
  console.error(`[ERROR:${today.toISOString()}] ${message}`);
};

/**
 * @param {string} message
 */
const createWarn = (message) => {
  console.warn(`[WARN:${today.toISOString()}] ${message}`);
};

/**
 * @param {Discord.Client} client
 * @param {string} postInChannelId Discord.Channel.id
 * @param {string} type success | info | warning | error
 * @param {string} causedByGuildMemberId Discord.GuildMember.id
 * @param {string} causedBy What did cause the event?
 * @param {string} message What excatly happend?
 */
const createEmbedLog = (
  client,
  postInChannelId,
  type = "info",
  causedByGuildMemberId,
  causedBy,
  message
) => {
  const channel = client.channels.cache.find((channel) => channel.id == postInChannelId);
  if (channel.type !== "text") {
    createError(`Channel '${postInChannelId}' ist kein Textkanal!`);
    return;
  }

  var messageColor, messageTitle;
  switch (type) {
    case "success":
      messageTitle = "Mitteilung";
      messageColor = logs.colors.success;
      break;

    case "warn":
      messageTitle = "Warnung";
      messageColor = logs.colors.warning;
      break;

    case "error":
      messageTitle = "Fehlermeldung";
      messageColor = logs.colors.error;
      break;

    case "info":
    default:
      messageTitle = "Information";
      messageColor = logs.colors.information;
      break;
  }

  const msg = {
    content: ``,
    embed: {
      title: messageTitle,
      color: messageColor,
      fields: [
        {
          name: "Handlung",
          value: causedBy,
          inline: true,
        },
        {
          name: "Verursacht durch",
          value: `<@${causedByGuildMemberId}>`,
          inline: true,
        },
        {
          name: "Nachricht",
          value: message,
          inline: false,
        },
      ],
    },
  };

  channel
    .send(msg)
    .then(() => createLog("Log for '" + message + "' was sent!"))
    .catch((err) => createError(err));
};

/**
 * @param {Discord.Client} client
 * @param {string} postInChannelId Discord.Channel.id
 * @param {Discord.GuildMember} newMember
 */
const sendWelcomeMessage = (client, postInChannelId, newMember) => {
  const channel = client.channels.cache.find((channel) => channel.id === postInChannelId);
  if (channel.type !== "text") {
    createError(`Channel '${postInChannelId}' ist kein Textkanal!`);
    return;
  }

  const msg = {
    embed: {
      title: `Willkommen ${newMember.user.username},`,
      description: `wir heißen dich auf dem Discord-Server der DulliAG herzlich willkommen. Für mehr Informationen über die DulliAG besuche doch unsere [Webseite](https://dulliag.de) und am besten schaust du dir mal unsere allgemeines Verhaltensregeln an.`,
      color: logs.colors.success,
      timestamp: new Date(),
      author: {
        name: newMember.user.username,
        icon_url: newMember.avatarURL,
      },
    },
  };

  channel
    .send(msg)
    .then(() =>
      createLog("Willkommensnachricht für '" + newMember.user.username + "' wurde verschickt!")
    )
    .catch((err) => createError(err));
};

/**
 * @param {Discord.GuildMember} member
 * @returns {boolean}
 */
const isBot = (member) => {
  return member.bot;
};

/**
 *
 * @param {Discord.GuildMember} member
 * @param {string[]} requiredPermissions
 * @returns {boolean}
 */
const hasPermission = (member, requiredPermissions) => {
  var hasPermissions = true;
  requiredPermissions.forEach((perm) => {
    if (!member.hasPermission(perm)) hasPermission = false;
  });
  return hasPermissions;
};

/**
 * @deprecated
 * @param {Discord.Message} message
 * @param {string[]} requiredPermissions
 * @returns {boolean}
 */
const checkCommand = (message, requiredPermissions) => {
  const prefix = commands.prefix,
    prefixLength = prefix.length;

  if (isBot(message.member)) return; // Check if the message author is an Discord-bot

  createLog(`${message.author.username} tried command '${message.content}'`);

  if (message.content.substr(0, prefixLength) !== prefix) return; // Check if the command is an actuall bot command

  if (commands.blacklist.includes(prefix)) return; // Check if the command-prefix is blacklisted

  var hasPermissions = true;

  requiredPermissions.forEach((perm) => {
    if (!message.member.hasPermission(perm)) hasPermissions = false;
  });

  return hasPermissions;
};

module.exports = {
  isBot: isBot,
  checkCommand: checkCommand,
  hasPermission: hasPermission,
  log: createLog,
  error: createError,
  warn: createWarn,
  sendEmbedLog: createEmbedLog,
  sendWelcomeMessage: sendWelcomeMessage,
};

/**
  "commands": [
    { "syntax": "!db clear", "description": "Säubern eines Kanals" },
    { "syntax": "!db version", "description": "Aktuelle Version abfragen" },
    {
      "syntax": "!db aupdate",
      "description": "Prüfen ob ein neues ReallifeRPG Mod-Update zur Verfügung steht"
    }
  ]
*/
