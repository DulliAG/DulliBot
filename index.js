const Discord = require("discord.js");
const client = new Discord.Client();
const cron = require("cron").CronJob;

const { token, clientId, roles, channels, stocks, arma, rbr, settings } = require("./config.json");
const { version } = require("./package.json");
const checkArmaUpdate = require("./functions/checkArmaUpdate");
const memberCounter = require("./functions/memberCounter");
const getStock = require("./functions/getStock");
const roleClaim = require("./functions/roleClaim");
const sendLog = require("./functions/sendLog");

client.on("ready", () => {
  console.log(`Logged in as ${client.user.tag}!`);
  sendLog(client, "Bot starten", clientId, "Der Bot wurde erfolgreich gestartet!");

  if (arma.enabled) {
    const arma = new cron("*/15 * * * *", () => {
      checkArmaUpdate(client, clientId);
    });
    arma.start();
  }

  // Run role-by-reaction if it it enabled
  if (rbr.enabled) roleClaim(client, clientId);

  // Run stocks if they are enabled
  if (stocks.enabled) {
    const nasdaq = new cron("0 1 22 * * 1-5", () => {
      stocks.map((stock) => {
        if (stock.place == "NASDAQ") {
          getStock(client, channels.stocks, stock, clientId);
          getStock(stock).catch((err) => console.error("[DulliBot]", err));
        }
      });
    });
    const fra = new cron("0 1 20 * * 1-5", () => {
      stocks.map((stock) => {
        if (stock.place == "FRA") {
          getStock(client, channels.stocks, stock, clientId);
          getStock(stock).catch((err) => console.error("[DulliBot]", err));
        }
      });
    });
    fra.start();
    nasdaq.start();
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
  if (msg.content.substr(0, 1) == "!") {
    const cmd = msg.content,
      cmdWithoutParams = cmd.split(/ /g)[0],
      action = cmd.substr(1, cmd.length).split(/ /g)[0];
    // TODO Register commands in config-file & add required permissions for each command, custom error messages
    // Check if the command is blacklisted and we don't want an event
    if (!settings.blacklist.includes(cmdWithoutParams)) {
      // Check if the sender is an user or an bot
      // Only when the sender is an user the event should be triggered
      if (!msg.author.bot) {
        switch (action) {
          case "ban":
            // We only search for the Gründer-role bcause this should be the only role/group who should be allowed to ban member
            var target = msg.mentions.users.first();
            if (msg.member.roles.cache.has(roles.gruender)) {
              if (target) {
                target = msg.guild.members.cache.get(target.id);
                target.ban();
                msg.reply(`das Mitglied **${target.user.username}** wurde **permanent gebannt**!`);
                sendLog(
                  client,
                  msg.content,
                  msg.author.id,
                  `DulliBot: Das Mitglied **<@${target.user.username}>** wurde **permanent gebannt**!`
                );
              } else {
                msg.reply(`das Mitglied **<@${target}>** existiert nicht!`);
                sendLog(
                  client,
                  msg.content,
                  msg.author.id,
                  `DulliBot: Hat versucht das Mitglied **<@${target}>** zu bannen!`
                );
              }
            } else {
              msg.reply("hat keine Rechte um Mitglieder zu bannen!");
              sendLog(
                client,
                msg.content,
                msg.author.id,
                `DulliBot: Hat versucht das Mitglied **<@${target.id}>** zu bannen!`
              );
            }
            break;

          case "kick":
            var target = msg.mentions.users.first();
            if (msg.member.roles.cache.has(roles.gruender)) {
              if (target) {
                target = msg.guild.members.cache.get(target.id);
                target.kick();
                msg.reply(`das Mitglied **${target.user.username}** wurde **gekickt**!`);
                sendLog(
                  client,
                  msg.content,
                  msg.author.id,
                  `DulliBot: Das Mitglied **<@${target.id}>** wurde gekickt!`
                );
                // TODO Send an notification-message to the kicked player
              } else {
                msg.reply(`das Mitglied **<@${target}>** existiert nicht!`);
                sendLog(
                  client,
                  msg.content,
                  msg.author.id,
                  `DulliBot: Hat versucht das Mitglied **<@${target}>** zu kicken!`
                );
              }
            } else {
              msg.reply("hat keine Rechte um Mitglieder zu kicken!");
              sendLog(
                client,
                msg.content,
                msg.author.id,
                `DulliBot: Hat versucht das Mitglied **<@${target.id}>** zu kicken!`
              );
            }
            break;

          case "stocks":
            // Check if stocks are enabled
            if (stocks.enabled) {
              stocks.stocks.map((stock) => {
                getStock(client, msg.channel.id, stock, clientId);
              });
            } else {
              msg.reply(" Aktien wurden nicht aktiviert!");
            }
            break;

          case "clear":
            if (
              msg.member.roles.cache.has(roles.gruender) ||
              msg.member.roles.cache.has(roles.coding)
            ) {
              msg.channel.messages.fetch().then((messages) => {
                msg.channel
                  .bulkDelete(messages)
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
            } else {
              msg.reply("hat keine Rechte zum aufräumen des Kanals!");
            }
            break;

          case "version":
            msg.reply(`ich laufe auf der Version ${version}!`);
            break;

          case "aupdate":
            checkArmaUpdate(client, clientId);
            break;

          default:
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
                  value: `!clear | Kanalnachrichten leeren\n!ban | Mitglied bannen\n!kick | Mitglied kicken\n!stocks | Aktienkurse abrufen\n!version | Version anzeigen\n!aupdate | Prüfe ob ein neues ReallifeRPG Update zur Verfügung steht`,
                }
              )
              .setTimestamp()
              .setFooter("by DulliBot", "https://files.dulliag.de/web/images/logo.jpg");
            client.channels.cache.get(msg.channel.id).send(errorMsg);
            break;
        }
      }
    }
  }
});

client.login(token);
