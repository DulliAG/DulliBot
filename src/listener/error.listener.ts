import { LogVariant } from '@dulliag/logger.js';
import { Client } from 'discord.js';
import { createLog } from '../Log';

export default (client: Client) => {
  client.on('error', (err) => {
    createLog(LogVariant.ERROR, 'Unknown', JSON.stringify(err));
  });
};
