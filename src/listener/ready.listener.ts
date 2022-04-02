import dotenv from 'dotenv';
dotenv.config();
import { Client } from 'discord.js';
import { LogVariant } from '@dulliag/logger.js';
import { log } from '@dulliag/discord-helper';

import { bot, arma, roles_by_reaction } from '../config.json';
import { createLog } from '../Log';
import ReallifeRpgUpdates from '../core/realliferpg-updates';
import { Commands } from '../core/command';
import roleClaim from '../core/role-claim';
const PRODUCTION = process.env.PRODUCTION == 'true';

export default (client: Client) => {
  client.on('ready', async () => {
    log(`Logged in as ${client.user?.username}!`);

    if (PRODUCTION) {
      log(`Application is running in production-mode!`);
      createLog(LogVariant.INFORMATION, 'Bot started', `${client.user?.username} started!`);
    }

    // Check for ReallifeRPG updates (if enabled)
    if (arma.enabled) {
      const task = ReallifeRpgUpdates(client);
      task.fireOnTick();
      task.start();
    }

    // Initiate roles-by-reaction (if enabled)
    if (roles_by_reaction.enabled) {
      roleClaim(client);
    }

    client.user?.setActivity({ name: bot.activity, type: 'WATCHING' });
    createLog(LogVariant.INFORMATION, 'Setup', `Set activity to '${bot.activity}'`);

    await client.application?.commands.set(Commands);
    createLog(LogVariant.INFORMATION, 'Setup', 'Registered our custom /-commands');
  });
};
