require('dotenv').config();
const { Client } = require('discord.js');
const client = new Client({ intents: ['GUILDS', 'GUILD_MESSAGES'] });
const cron = require('cron').CronJob;

const helper = require('@dulliag/discord-helper');
const {
  bot,
  commands,
  clientId,
  roles,
  arma,
  channels,
  roles_by_reaction,
} = require('./config.json');
const { version } = require('./package.json');
const checkArmaUpdate = require('./functions/checkArmaUpdate');
const memberCounter = require('./functions/memberCounter');
const roleClaim = require('./functions/roleClaim');

client.on('ready', () => {
  helper.log(`Logged in as ${client.user.tag}!`);
  // Set bot-information
  client.user.setActivity({ name: bot.activity });

  // Check for ReallifeRPG updates if the feature is enabled
  if (arma.enabled) {
    const arma = new cron('*/15 * * * *', () => {
      checkArmaUpdate(client, clientId);
    });
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
    .then(() =>
      helper.log("Rolle 'Guest' wurde dem Benutzer '" + member.user.tag + "' zugewiesen!")
    )
    .catch((err) => helper.error("Rolle 'Gast' zuweisen! Aufgrund von: " + err));

  // Send welcome-message for an new member
  helper.sendWelcomeMessage(client, channels.welcome, member);
});

client.on('guildMemberRemove', (member) => {
  memberCounter(client, member);
});

client.on('messageCreate', (msg) => {
  if (helper.isBot(msg.member)) return;

  if (msg.content.substring(0, commands.prefix.length) !== commands.prefix) return;

  const cmd = msg.content,
    action = cmd.split(/ /g)[1];

  switch (action) {
    case 'CLEAR':
    case 'clear':
      if (!msg.member.permissions.has('MANAGE_MESSAGES')) {
        msg.reply('du hast keine Rechte zum säubern des Kanals!');
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
            helper.log(`${msg.member.user.username} hat den Kanal ${msg.channel.name} gesäubert!`);
          })
          .catch((err) => {
            msg.reply(
              'Der Befehl konnte nicht ausgeführt werden. Ein Fehlerbericht wurde erstellt!'
            );
            helper.error(
              `${msg.member.user.username} hat den Kanal ${msg.channel.name} gesäubert! Grund: ${err}`
            );
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
