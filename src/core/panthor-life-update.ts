import { Client } from 'discord.js';
import { CronJob } from 'cron';
import fs from 'fs';
import { format, parseISO } from 'date-fns';
import axios from 'axios';

import { logger } from './log';
import { channels } from '../config.json';

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

export const getChangelogs = () => {
  return axios
    .get('https://api.panthor.de/v1/changelog')
    .then((response) => {
      if (response.status !== 200) throw new Error(response.statusText);
      return response.data;
    })
    .catch((err) => {
      throw err;
    });
};

const LOG_CATEGORY = 'Fetch4Updates';

export default (client: Client) => {
  return new CronJob('*/15 * * * *', async () => {
    const CFG = JSON.parse(fs.readFileSync('./src/config.json', 'utf-8'));
    const LATEST_VERSION = CFG.arma.current_version;
    const CHANGELOGS = await getChangelogs();
    const LATEST_CHANGELOG = CHANGELOGS.data.shift();

    if (!CHANGELOGS || !LATEST_CHANGELOG) {
      return await logger.log('ERROR', LOG_CATEGORY, "Can't retrieve changelogs!");
    }

    if (LATEST_CHANGELOG && LATEST_CHANGELOG.version === LATEST_VERSION) return;
    client.guilds.cache.forEach((guild) => {
      const channel = guild.channels.cache.find((channel) => channel.id == channels.arma);
      if (channel && channel.isText()) {
        channel
          .send({
            // content: `<@&${roles.rlrpg}>`,
            content: 'q',
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
          .then(async () => {
            CFG.arma.current_version = LATEST_CHANGELOG.version;
            fs.writeFileSync('./src/config.json', JSON.stringify(CFG));

            await logger.log(
              'LOG',
              LOG_CATEGORY,
              `Benachrichtigung für Version '${LATEST_CHANGELOG.version}' wurde verschickt!`
            );
          })
          .catch(async (err) => {
            await logger.log(
              'ERROR',
              LOG_CATEGORY,
              'Benachrichtigung für Arma Changelogs abschicken. Grund: ' + err
            );
          });
      }
    });
  });
};
