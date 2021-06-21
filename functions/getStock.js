const puppeteer = require("puppeteer");
const sendLog = require("./sendLog");

module.exports = async (client, channelId, stock, botId) => {
  try {
    const stockChannel = client.channels.cache.find((channel) => channel.id == channelId);
    var browser;

    // if (os.type().includes("WINDOWS")) {
    //   browser = await puppeteer.launch();
    // } else {
    //   browser = await puppeteer.launch({ args: ["--no-sandbox", "--disable-setuid-sandbox"] });
    // }
    browser = await puppeteer.launch({ args: ["--no-sandbox", "--disable-setuid-sandbox"] });
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
  } catch (err) {
    sendLog(client, "Aktienkurse abrufen", botId, err);
  }
};
