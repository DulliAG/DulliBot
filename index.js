const Discord = require("discord.js");
const { token, roles, channels, stocks } = require("./config.json");
const roleClaim = require("./role-claim");
const cron = require("cron").CronJob;
const client = new Discord.Client();
const puppeteer = require("puppeteer");

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
  client.channels.cache.get(channels.botDevelopment).send(errorMsg);
}

/**
 * @param {object} stock Contains place, company & symbol
 */
async function getStock(stock) {
  let stockChannel = client.channels.cache.find((channel) => channel.id == channels.stocks);
  const browser = await puppeteer.launch();
  const page = await browser.newPage();
  await page.goto(`https://www.google.com/search?tbm=fin&q=${stock.place}:+${stock.symbol}`);

  var [price] = await page.$x('//*[@class="IsqQVc NprOob XcVN5d"]');
  var priceTxt = await price.getProperty("textContent");
  var rawPriceTxt = await priceTxt.jsonValue();

  var [currency] = await page.$x('//*[@class="knFDje"]');
  var currencyTxt = await currency.getProperty("textContent");
  var rawCurrencyTxt = await currencyTxt.jsonValue();

  var [date] = await page.$x('//*[@jsname="ihIZgd"]');
  var dateTxt = await date.getProperty("textContent");
  var rawDateTxt = await dateTxt.jsonValue();

  var [open] = await page.$x(
    '//*[@id="knowledge-finance-wholepage__entity-summary"]/div/div/g-card-section[2]/div/div/div[1]/table/tbody/tr[1]/td[2]'
  );
  var openTxt = await open.getProperty("textContent");
  var rawOpenTxt = await openTxt.jsonValue();

  var [high] = await page.$x(
    '//*[@id="knowledge-finance-wholepage__entity-summary"]/div/div/g-card-section[2]/div/div/div[1]/table/tbody/tr[2]/td[2]'
  );
  var highTxt = await high.getProperty("textContent");
  var rawHighTxt = await highTxt.jsonValue();

  var [low] = await page.$x(
    '//*[@id="knowledge-finance-wholepage__entity-summary"]/div/div/g-card-section[2]/div/div/div[1]/table/tbody/tr[3]/td[2]'
  );
  var lowTxt = await low.getProperty("textContent");
  var rawLowTxt = await lowTxt.jsonValue();

  var [volume] = await page.$x(
    '//*[@id="knowledge-finance-wholepage__entity-summary"]/div/div/g-card-section[2]/div/div/div[1]/table/tbody/tr[4]/td[2]'
  );
  var volumeTxt = await volume.getProperty("textContent");
  var rawVolumeTxt = await volumeTxt.jsonValue();

  const stockData = {
    symbol: stock.symbol,
    company: stock.company,
    place: stock.place,
    date: rawDateTxt,
    currency: rawCurrencyTxt,
    current: rawPriceTxt,
    open: rawOpenTxt,
    high: rawHighTxt,
    low: rawLowTxt,
    volume: rawVolumeTxt,
  };

  const msg = {
    embed: {
      title: `${stockData.place} | ${stockData.symbol} | ${stockData.company}`,
      color: 2664261,
      timestamp: stockData.date,
      fields: [
        {
          name: "Details",
          value: `:red_circle: Aktuell: ${
            stockData.current + stockData.currency
          }\n:clock330: Eröffnet: ${
            stockData.open + stockData.currency
          }\n:chart_with_upwards_trend: Hoch: ${
            stockData.high + stockData.currency
          }\n:chart_with_downwards_trend: Tief: ${
            stockData.low + stockData.currency
          }\n:bank: Marktkapital: ${stockData.volume + stockData.currency}`,
        },
      ],
      footer: {
        icon_url: "https://files.dulliag.de/web/images/logo.jpg",
        text: "by DulliBot",
      },
    },
  };
  stockChannel.send(msg);

  browser.close();
}

client.on("ready", () => {
  console.log(`Logged in as ${client.user.tag}!`);
  sendError("Bot gestartet", "669622328325570571", "Der Bot wurde so eben gestartet");
  roleClaim(client); // TODO Create an own custom solution for this feature
  const nasdaq = new cron("0 1 22 * * 0-5", function () {
    for (const key in stocks) {
      const stock = stocks[key];
      if (stock.place == "NASDAQ") {
        getStock(stock);
      }
    }
  });

  const fra = new cron("0 1 20 * * 0-5", function () {
    for (const key in stocks) {
      const stock = stocks[key];
      if (stock.place == "FRA") {
        getStock(stock);
      }
    }
  });

  fra.start();
  nasdaq.start();
});

client.on("guildMemberAdd", (member) => {
  client.channels.cache
    .get(channels.stats.member)
    .setName(`Mitglieder: ${member.guild.members.cache.filter((m) => !m.user.bot).size}`);
  client.channels.cache
    .get(channels.stats.bots)
    .setName(`Bots: ${member.guild.members.cache.filter((m) => m.user.bot).size}`);

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
      welcomeChannel.send(welcomeMsg);
    })
    .catch((err) => {
      sendError("Willkommensnachricht schicken", err);
    });
});

client.on("guildMemberRemove", (member) => {
  client.channels.cache
    .get(channels.stats.member)
    .setName(`Mitglieder: ${member.guild.members.cache.filter((m) => !m.user.bot).size}`);
  client.channels.cache
    .get(channels.stats.bots)
    .setName(`Bots: ${member.guild.members.cache.filter((m) => m.user.bot).size}`);
});

client.on("message", (msg) => {
  // Only for messages written by an user
  if (msg.author.bot == false) {
    if (msg.content.includes("!ban")) {
      /**
       * !ban
       */
      // We only search for the Gründer-role bcause this should be the only role/group who should be allowed to ban member
      var target = msg.mentions.users.first();
      if (msg.member.roles.cache.has(roles.gruender)) {
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
        sendError(msg.content, msg.author.id, `DulliBot: Hat versucht <@${target.id}> zu bannen!`);
      }
    } else if (msg.content.includes("!kick")) {
      /**
       * !kick
       */
      var target = msg.mentions.users.first();
      if (msg.member.roles.cache.has(roles.gruender)) {
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
        sendError(msg.content, msg.author.id, `DulliBot: Hat versucht <@${target.id}> zu kicken!`);
      }
    } else if (msg.content == "!clear") {
      /**
       * !clear
       */
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
    } else if (msg.content == "!stocks") {
      /**
       * !stocks
       */
      stocks.forEach((stock) => {
        // getStocks(stock, "1min");
        getStock(stock);
      });
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
            value: `!clear | Kanalnachrichten leeren\n!ban | Mitglied bannen\n!kick | Mitglied kicken\n!stocks | Aktienkurse abrufen`,
          }
        )
        .setTimestamp()
        .setFooter("by DulliBot", "https://files.dulliag.de/web/images/logo.jpg");
      client.channels.cache.get(msg.channel.id).send(errorMsg);
    }
  }
});

client.login(token);
