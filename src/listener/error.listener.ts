import { Client } from 'discord.js';
import { log } from '../log';

export default (client: Client) => {
  client.on('error', (err) => {
    log('ERROR', 'Unknown', JSON.stringify(err));
  });
};
