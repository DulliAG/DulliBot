import { Client } from 'discord.js';
import { logger } from '../core/log';

export default (client: Client) => {
  client.on('error', async (err) => {
    await logger.log('ERROR', 'Unknown', JSON.stringify(err));
  });
};
