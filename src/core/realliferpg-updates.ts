import { Client } from 'discord.js';
import { CronJob } from 'cron';
import { LogVariant } from '@dulliag/logger.js';
import fs from 'fs';
import { format, parseISO } from 'date-fns';
import axios from 'axios';

import { createLog } from '../Log';
import { arma, channels, roles } from '../config.json';

interface IChangelog {
  id: number;
  version: string;
  note: string;
  active: number;
  size: string;
  change_mission: string[];
  change_map: string[];
  change_mod: string[];
  release_at: string;
  created_at: string;
  updated_at: string;
}

const getChangelogs = () => {
  return axios
    .get('https://api.realliferpg.de/v1/changelog')
    .then((response) => {
      if (response.status !== 200) throw new Error(response.statusText);
      return response.data;
    })
    .catch((err) => {
      throw err;
    });
};

const LOG_CATEGORY = 'Fetch4Updates';
const CFG = require('../config.json');

export default (client: Client) => {
  return new CronJob('*/15 * * * *', async () => {
    createLog(LogVariant.INFORMATION, LOG_CATEGORY, 'Check for new ReallifeRPG mod updates...');

    const LATEST_VERSION = arma.current_version;

    const CHANGELOGS = await getChangelogs();
    const LATEST_CHANGELOG = CHANGELOGS.data.shift();

    if (!CHANGELOGS || !LATEST_CHANGELOG) {
      createLog(LogVariant.ERROR, LOG_CATEGORY, "Can't retrieve changelogs!");
      return;
    }

    if (LATEST_CHANGELOG && LATEST_CHANGELOG.version === LATEST_VERSION) {
      createLog(LogVariant.INFORMATION, LOG_CATEGORY, 'There is no new update avaiable!');
      return;
    }

    client.guilds.cache.forEach((guild) => {
      const channel = guild.channels.cache.find((channel) => channel.id == channels.arma);
      if (channel && channel.isText()) {
        channel
          .send({
            content: `<@&${roles.rlrpg}>`,
            embeds: [
              {
                title: `Changelog v${LATEST_CHANGELOG.version}`,
                description: `Es gibt einen neuen Changelog!\n Das Update steht im Launcher am **${format(
                  parseISO(LATEST_CHANGELOG.release_at),
                  'dd.mm.yyy'
                )} ab ${format(
                  parseISO(LATEST_CHANGELOG.release_at),
                  'hh:mm'
                )} Uhr** zum herunterladen bereit und ist **${LATEST_CHANGELOG.size}** groß.`,
                color: 2664261,
                timestamp: new Date(),
                footer: {
                  text: 'by DulliBot',
                },
              },
            ],
          })
          .then(() => {
            CFG.arma.current_version = LATEST_CHANGELOG.version;
            fs.writeFileSync('./config.json', JSON.stringify(CFG));

            createLog(
              LogVariant.INFORMATION,
              LOG_CATEGORY,
              `Benachrichtigung für Version '${LATEST_CHANGELOG.version}' wurde verschickt!`
            );
          })
          .catch((err) =>
            createLog(
              LogVariant.ERROR,
              LOG_CATEGORY,
              'Benachrichtigung für Arma Changelogs abschicken. Grund: ' + err
            )
          );
      }
    });
  });
};
