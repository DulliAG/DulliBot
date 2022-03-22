require('dotenv').config();
const { Client } = require('discord.js');
const client = new Client({ intents: ['GUILDS', 'GUILD_MESSAGES'] });
const cron = require('cron').CronJob;

const helper = require('@dulliag/discord-helper');
const { logger, logType, createLog } = require('./Logs');
const {
  bot,
  commands,
  clientId,
  roles,
  arma,
  channels,
  roles_by_reaction,
  auto_publish,
} = require('./config.json');
const { version } = require('./package.json');
const checkArmaUpdate = require('./functions/checkArmaUpdate');
const memberCounter = require('./functions/memberCounter');
const roleClaim = require('./functions/roleClaim');

const PRODUCTION = process.env.PRODUCTION == 'true';

client.on('ready', () => {
  helper.log(`Logged in as ${client.user.tag}!`);
  if (PRODUCTION) {
    logger.application = client.user.tag;
    helper.log(`Application is running in production-mode!`);
    createLog(logType.INFORMATION, 'Bot started', `${client.user.tag} started!`);
  }

  // Set bot-information
  client.user.setActivity({ name: bot.activity });

  // Check for ReallifeRPG updates if the feature is enabled
  if (arma.enabled) {
    const arma = new cron('*/15 * * * *', () => {
      checkArmaUpdate(client);
    });
    if (!PRODUCTION) arma.fireOnTick();
    arma.start();
  }

  // Run roles-by-reaction if enabled
  if (roles_by_reaction.enabled) roleClaim(client, clientId);
});

client.on('guildMemberAdd', (member) => {
  // Update stats
  memberCounter(client, member);

  // Add 'guest'-role to every new member
  let guest_role = member.guild.roles.cache.find((role) => role.id === roles.guest);
  member.roles
    .add(guest_role)
    .then(() => {
      let log = "Rolle 'Guest' wurde dem Benutzer '" + member.user.tag + "' zugewiesen!";
      helper.log(log);
      createLog(logType.INFORMATION, 'Member join', log);
    })
    .catch((err) => {
      let log = "Rolle 'Gast' zuweisen! Aufgrund von: " + err;
      helper.error(log);
      createLog(logType.ERROR, 'Member join', log);
    });

  // Send welcome-message for an new member
  helper.sendWelcomeMessage(client, channels.welcome, member);
});

client.on('guildMemberRemove', (member) => {
  memberCounter(client, member);
});

client.on('messageCreate', (msg) => {
  // Listen for news auto-publishing
  if (
    auto_publish.enabled &&
    msg.channel.type == 'GUILD_NEWS' &&
    auto_publish.categories.includes(msg.channel.parentId) &&
    msg.crosspostable
  ) {
    msg.crosspost().then(() => {
      let log = `Published message in '${msg.channel.name}'!`;
      helper.log(log);
      createLog(logType.INFORMATION, 'Publish news', log);
    });
    return;
  }

  // Listen for commands
  if (helper.isBot(msg.member)) return;

  if (msg.content.substring(0, commands.prefix.length) !== commands.prefix) return;

  const cmd = msg.content,
    action = cmd.split(/ /g)[1];

  createLog(logType.INFORMATION, 'Use command', `${msg.author.username} used the command ${cmd}!`);

  switch (action) {
    case 'CLEAR':
    case 'clear':
      if (!msg.member.permissions.has('MANAGE_MESSAGES')) {
        msg.reply('du hast keine Rechte zum säubern des Kanals!');
        createLog(
          logType.WARNING,
          'Permissions',
          `${msg.author.username} used the command ${cmd} without permissions!`
        );
        return;
      }

      msg.channel.messages.fetch().then((messages) => {
        msg.channel
          .bulkDelete(
            messages,
            true /*filter old messages means only messages within the last 14 days are gonna get removed*/
          )
          .then(() => {
            msg.reply('hat den Kanal aufgeräumt');
            let log = `${msg.member.user.username} hat den Kanal ${msg.channel.name} gesäubert!`;
            helper.log(log);
            createLog(logType.INFORMATION, 'Use Command', log);
          })
          .catch((err) => {
            msg.reply(
              'Der Befehl konnte nicht ausgeführt werden. Ein Fehlerbericht wurde erstellt!'
            );
            let log = `${msg.member.user.username} hat den Kanal ${msg.channel.name} gesäubert! Grund: ${err}`;
            helper.error(log);
            createLog(logType.ERROR, 'Use Command', log);
          });
      });
      break;

    case 'VERSION':
    case 'version':
      msg.reply(`ich laufe auf der Version ${version}!`);
      break;

    case 'AUPDATE':
    case 'aupdate':
      checkArmaUpdate(client, clientId);
      break;

    case 'HELP':
    case 'help':
    default:
      // var txt = "";
      // commands.forEach((cmd) => {
      //   txt += `${cmd.syntax} | ${cmd.description}\n`;
      // });
      // const errorMsg = new Discord.MessageEmbed()
      //   .setColor("#fd0061")
      //   .setTitle("Befehle")
      //   .addFields(
      //     {
      //       name: "Versuchter Befehl",
      //       value: `${msg.content}`,
      //     },
      //     {
      //       name: "Registrierte Befehle",
      //       value: txt,
      //     }
      //   )
      //   .setTimestamp()
      //   .setFooter("by DulliBot", client.user.displayAvatarURL());
      // client.channels.cache.get(msg.channel.id).send(errorMsg);
      break;
  }
});

client.login(process.env.TOKEN);
