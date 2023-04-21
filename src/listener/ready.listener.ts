import dotenv from 'dotenv';
dotenv.config();
import { Client } from 'discord.js';
import { readFileSync, writeFile } from 'fs';
import { bot, arma, roles_by_reaction } from '../config.json';
import { logger } from '../core/log';
import PanthorLifeUpdate, { getChangelogs } from '../core/panthor-life-update';
import { Commands } from '../core/command';
import roleClaim from '../core/role-claim';
import { handleError } from '../handler/error.handler';
import { PRODUCTION } from '../constants';

export default (client: Client) => {
  client.on('ready', async () => {
    try {
      await logger.log('INFO', 'Setup', `Logged in as ${client.user?.username}!`);

      if (PRODUCTION) {
        await logger.log('INFO', 'Setup', `Application is running in production-mode!`);
        await logger.log('LOG', 'Setup', `${client.user?.username} started!`);
      }

      // Check for Panthor Life updates (if enabled)
      if (arma.enabled) {
        const CFG = JSON.parse(readFileSync('./src/config.json', 'utf-8'));
        const task = PanthorLifeUpdate(client);
        const changelogs = await getChangelogs();
        const latestChangelog = changelogs.data.shift();
        CFG.arma.current_version = latestChangelog.version;
        writeFile('./src/config.json', JSON.stringify(CFG), (err) => {
          if (err) throw err;
          task.start();
        });
      }

      // Initiate roles-by-reaction (if enabled)
      if (roles_by_reaction.enabled) {
        roleClaim(client);
      }

      client.user?.setActivity({ name: bot.activity, type: 'WATCHING' });
      await logger.log('LOG', 'Setup', `Set activity to '${bot.activity}'`);

      await client.application?.commands.set(Commands);
      await logger.log('INFO', 'Setup', 'Registered our custom /-commands');
    } catch (error) {
      handleError(error, 'Setup');
    }
  });
};
