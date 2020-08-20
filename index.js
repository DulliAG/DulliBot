const Discord = require("discord.js");
const { token, roles, channels, stocks } = require("./config.json");
const roleClaim = require("./role-claim");
const Stocks = require("stocks.js");
const cron = require("cron").CronJob;
const client = new Discord.Client();

function sendError(action, actionByMemberId, error) {
  const errorMsg = new Discord.MessageEmbed()
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
        value: error,
      }
    )
    .setTimestamp()
    .setFooter("by DulliBot", "https://files.dulliag.de/web/images/logo.jpg");
  client.channels.cache.get(channels.botDevelopment).send(`<@&${roles.coding}>`, errorMsg);
}

function getStocks() {
  let stockChannel = client.channels.cache.find((channel) => channel.id == channels.stocks);
  const stockAPI = new Stocks("SYTCQBUIU44BX2G4");
  stocks.forEach((stock) => {
    new Promise((res, rej) => {
      var result = stockAPI.timeSeries({
        symbol: stock.short,
        interval: "daily",
        amount: 1,
      });
      res(result);
    }).then((data) => {
      let temp = {
        open: data[0].open,
        high: data[0].high,
        low: data[0].low,
        close: data[0].close,
        volume: data[0].volume,
        date: data[0].date,
      };
      const stockMsg = {
        embed: {
          title: `${stock.short} | ${stock.company}`,
          color: 2664261,
          timestamp: temp.date,
          footer: {
            icon_url: "https://files.dulliag.de/web/images/logo.jpg",
            text: "by DulliBot & Stocks.JS",
          },
          /*image: {
            url:
              "https://quickchart.io/chart?bkg=white&c=%7Btype%3A%27bar%27%2Cdata%3A%7Bdatasets%3A%5B%7Blabel%3A%27Open%27%2Cdata%3A%5B%24%7Btemp.open%7D%2C%24%7Btemp.high%7D%2C%24%7Btemp.low%7D%2C%24%7Btemp.close%7D%5D%7D%2C%7Blabel%3A%27High%27%2Cdata%3A%5B%24%7Btemp.high%7D%5D%7D%2C%7Blabel%3A%27Low%27%2Cdata%3A%5B%24%7Btemp.low%7D%5D%7D%2C%7Blabel%3A%27Closed%27%2Cdata%3A%5B%24%7Btemp.close%7D%5D%7D%5D%7D%2Coptions%3A%7Bplugins%3A%20%7Bdatalabels%3A%20%7Bdisplay%3A%20true%2Cfont%3A%7Bstyle%3A%20%27bold%27%2C%7D%2C%7D%2C%7D%2C%7D%7D",
          },*/
          fields: [
            {
              name: "Details",
              value: `:clock330:  Eröffnet: ${temp.open} $\n:chart_with_upwards_trend: Hoch: ${temp.high} $\n:chart_with_downwards_trend: Tief: ${temp.low} $\n:clock10: Geschlossen: ${temp.close} $`,
            },
          ],
        },
      };
      stockChannel.send(stockMsg);
    });
  });
}

client.on("ready", () => {
  console.log(`Logged in as ${client.user.tag}!`);
  roleClaim(client); // TODO Create an own custom solution for this feature
  var job = new cron("0 1 22 * * 0-5", function () {
    getStocks();
  });
  job.start();
});

client.on("guildMemberAdd", (member) => {
  var role = member.guild.roles.cache.find((role) => role.id == roles.guest);
  var welcomeChannel = client.channels.cache.find((channel) => channel.id == channels.welcome);
  member.roles
    .add(role)
    .then(() => {
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
      member.send(welcomeMsg);
      welcomeChannel.send("@everyone", welcomeMsg);
    })
    .catch((err) => {
      sendError("Willkommensnachricht schicken", err);
    });
});

client.on("message", (msg) => {
  // Only for messages written by an user
  if (msg.author.bot == false) {
    if (msg.content.includes("!ban")) {
      // We only search for the Gründer-role bcause this should be the only role/groupd who should be allowed to ban member
      if (msg.member.roles.cache.has(roles.gruender)) {
        var target = msg.mentions.users.first();
        if (target) {
          target = msg.guild.members.cache.get(target.id);
          target.ban();
          msg.reply(`der Benutzer **${target.user.username}** wurde **permanent gebannt**!`);
          // TODO Send an notification-message to the banned player
          // TODO Send an log-message to the log-channel
        } else {
          msg.reply("der Benutzer existiert nicht!");
        }
      } else {
        msg.reply("hat keine Rechte um zu bannen!");
      }
    } else if (msg.content.includes("!kick")) {
      if (msg.member.roles.cache.has(roles.gruender)) {
        var target = msg.mentions.users.first();
        if (target) {
          target = msg.guild.members.cache.get(target.id);
          target.kick();
          msg.reply(`der Benutzer **${target.user.username}** wurde **gekickt**!`);
          // TODO Send an notification-message to the kicked player
          // TODO Send an log-message to the log-channel
        } else {
          msg.reply("der Benutzer existiert nicht!");
        }
      } else {
        msg.reply("hat keine Rechte um zu kicken!");
      }
    } else if (msg.content == "!clear") {
      if (msg.member.roles.cache.has(roles.gruender) || msg.member.roles.cache.has(roles.coding)) {
        msg.channel.messages.fetch().then((messages) => {
          msg.channel
            .bulkDelete(messages)
            .then(() => {
              msg.reply("hat den Kanal aufgeräumt");
            })
            .catch((err) => {
              msg.reply(
                "der Befehl konnte nicht ausgeführt werden. Ein Fehlerbericht wurde erstellt!"
              );
              sendError(msg.content, msg.author.id, err);
            });
        });
      } else {
        msg.reply("hat keine Rechte zum aufräumen des Kanals!");
      }
    } else if (msg.content.substring(0, 1) == "!") {
      // Send an message with an command-list
      // TODO Select command-list from command.json
      const errorMsg = new Discord.MessageEmbed()
        .setColor("#fd0061")
        .setTitle("Befehlsliste")
        .addFields(
          {
            name: "Versuchter Befehl",
            value: `${msg.content}`,
          },
          {
            name: "Registrierte Befehle",
            value: `!clear | Kanalnachrichten leeren\n!ban | Mitglied bannen\n!kick | Mitglied kicken`,
          }
        )
        .setTimestamp()
        .setFooter("by DulliBot", "https://files.dulliag.de/web/images/logo.jpg");
      client.channels.cache.get(msg.channel.id).send(errorMsg);
    }
  }
});

client.login(token);
