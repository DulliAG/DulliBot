require("dotenv").config();
const Discord = require("discord.js");
const client = new Discord.Client();
const cron = require("cron").CronJob;

const { clientId, settings, roles, arma, channels, roles_by_reaction, commands } = require("./config.json");
const { version } = require("./package.json");
const checkArmaUpdate = require("./functions/checkArmaUpdate");
const memberCounter = require("./functions/memberCounter");
const roleClaim = require("./functions/roleClaim");
const sendLog = require("./functions/sendLog");

client.on("ready", () => {
  console.log(`Logged in as ${client.user.tag}!`);
  client.user.setActivity("!db for more");
  sendLog(client, "Bot starten", clientId, "Der Bot wurde erfolgreich gestartet!");

  // TODO Create own Bot for this feature
  if (arma.enabled) {
    const arma = new cron("*/15 * * * *", () => {
      checkArmaUpdate(client, clientId);
    });
    arma.start();
  }

  // Run role-by-reaction if it it enabled
  if (roles_by_reaction.enabled) {
    roleClaim(client, clientId);
  }
});

client.on("guildMemberAdd", (member) => {
  // Update stats
  memberCounter(client, member);

  // Add guest role to new member
  const guestRole = member.guild.roles.cache.find((role) => role.id == roles.guest);
  member.roles
    .add(guestRole)
    .catch((err) => sendLog(client, "Rolle GAST zuweisen fehlgeschlagen", clientId, err));

  // Write welcome message
  const welcomeChannel = client.channels.cache.find((channel) => channel.id == channels.welcome);
  const welcomeMsg = {
    embed: {
      title: `Willkommen ${member.user.username},`,
      description: `wir heißen dich auf dem Discord-Server der DulliAG herzlich willkommen. Für mehr Informationen über die DulliAG besuche doch unsere [Webseite](https://dulliag.de) und am besten schaust du dir mal unsere allgemeines Verhaltensregeln an.`,
      color: 2664261,
      timestamp: new Date(),
      footer: {
        icon_url: "https://files.dulliag.de/web/images/logo.jpg",
        text: "by DulliBot",
      },
      author: {
        name: member.user.username,
        icon_url: member.avatarURL,
      },
    },
  };
  member
    .send(welcomeMsg)
    .catch((err) => sendLog(client, "Private Willkommensnachricht zustellen", clientId, err));
  welcomeChannel
    .send(welcomeMsg)
    .catch((err) => sendLog(client, "Serverweite Willkommensnachricht zustellen", clientId, err));
});

client.on("guildMemberRemove", (member) => {
  // Updates stats
  memberCounter(client, member);
});

client.on("message", (msg) => {
  if (msg.content.substr(0, 3) == "!db") {
    const cmd = msg.content,
      prefix = cmd.split(/ /g)[0],
      action = cmd.split(/ /g)[1];
    // Check if the command is blacklisted and we don't want an event
    if (!settings.blacklist.includes(prefix)) {
      // Check if the sender is an user or an bot
      // Only when the sender is an user the event should be triggered
      if (!msg.author.bot) {
        switch (action) {
          case "clear":
            if (!msg.member.hasPermission("MANAGE_MESSAGES")) {
              msg.reply("du hast keine Rechte zum säubern des Kanals!");
              return;
            }

            msg.channel.messages.fetch().then((messages) => {
              msg.channel
                .bulkDelete(
                  messages,
                  true /*filter old messages means only messages within the last 14 days are gonna get removed*/
                )
                .then(() => {
                  msg.reply("hat den Kanal aufgeräumt");
                })
                .catch((err) => {
                  msg.reply(
                    "Der Befehl konnte nicht ausgeführt werden. Ein Fehlerbericht wurde erstellt!"
                  );
                  sendLog(client, msg.content, msg.author.id, err);
                });
            });
            break;

          case "version":
            msg.reply(`ich laufe auf der Version ${version}!`);
            break;

          case "aupdate":
            checkArmaUpdate(client, clientId);
            break;

          default:
            var txt = "";
            commands.forEach((cmd) => {
              txt += `${cmd.syntax} | ${cmd.description}\n`;
            });
            const errorMsg = new Discord.MessageEmbed()
              .setColor("#fd0061")
              .setTitle("Befehle")
              .addFields(
                {
                  name: "Versuchter Befehl",
                  value: `${msg.content}`,
                },
                {
                  name: "Registrierte Befehle",
                  value: txt
                }
              )
              .setTimestamp()
              .setFooter("by DulliBot", client.user.displayAvatarURL());
            client.channels.cache.get(msg.channel.id).send(errorMsg);
            break;
        }
      }
    }
  }
});

client.login(process.env.TOKEN);
