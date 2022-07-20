import dotenv from 'dotenv';
dotenv.config();
import { Client } from 'discord.js';

import { bot, arma, roles_by_reaction } from '../config.json';
import { log } from '../log';
import ReallifeRpgUpdates from '../core/realliferpg-updates';
import { Commands } from '../core/command';
import roleClaim from '../core/role-claim';
const PRODUCTION = process.env.PRODUCTION == 'true';

export default (client: Client) => {
  client.on('ready', async () => {
    console.log(`Logged in as ${client.user?.username}!`);

    if (PRODUCTION) {
      log('INFORMATION', 'Setup', `Application is running in production-mode!`);
      log('LOG', 'Setup', `${client.user?.username} started!`);
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
    log('LOG', 'Setup', `Set activity to '${bot.activity}'`);

    await client.application?.commands.set(Commands);
    log('INFORMATION', 'Setup', 'Registered our custom /-commands');
  });
};
