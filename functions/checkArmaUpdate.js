const fetch = require("node-fetch");
const fs = require("fs");

const fileName = "../config.json";
const file = require(fileName);
const { channels } = require(fileName);
const sendLog = require("./sendLog");

module.exports = async (client, clientId) => {
  const { arma } = require(fileName);
  const lastCheckedVersion = arma.current_version;
  const response = await fetch("https://api.realliferpg.de/v1/changelog");
  const changelogs = await response.json();
  const newestChangelog = changelogs.data[0];
  const newestChangelogVersion = newestChangelog.version;
  const updateRelease = new Date(newestChangelog.release_at);
  const releaseDate = {
    day: updateRelease.getDate() > 9 ? updateRelease.getDate() : `0${updateRelease.getDate()}`,
    month:
      updateRelease.getMonth() + 1 > 9
        ? updateRelease.getMonth() + 1
        : `0${updateRelease.getMonth() + 1}`,
    year: updateRelease.getFullYear(),
    hours: updateRelease.getHours() > 9 ? updateRelease.getHours() : `0${updateRelease.getHours()}`,
    minutes:
      updateRelease.getMinutes() > 9
        ? updateRelease.getMinutes()
        : `0${updateRelease.getMinutes()}`,
  };

  if (lastCheckedVersion != newestChangelogVersion) {
    file.arma = { enabled: true, current_version: newestChangelogVersion };
    fs.writeFileSync("./config.json", JSON.stringify(file), function writeJSON(err) {
      if (err) return console.error(err);
    });
    const updateChannel = client.channels.cache.find((channel) => channel.id == channels.arma);
    const updateMessage = {
      embed: {
        title: `Changelog v${newestChangelogVersion}`,
        description: `Es gibt einen neuen Changelog!\n Das Update steht im Launcher am **${releaseDate.day}.${releaseDate.month}.${releaseDate.year} ab ${releaseDate.hours}:${releaseDate.minutes} Uhr** zum herunterladen bereit und ist **${newestChangelog.size}** groß.`,
        color: 2664261,
        timestamp: new Date(),
        footer: {
          icon_url: "https://files.dulliag.de/web/images/logo.jpg",
          text: "by DulliBot",
        },
      },
    };
    updateChannel
      .send(updateMessage)
      .catch((err) =>
        sendLog(client, "Benachrichtigung für Arma Changelogs abschicken", clientId, err)
      );
  }
};
