import { Client } from 'discord.js';

import { roles_by_reaction } from '../config.json';

export default (client: Client) => {
  client.on('messageReactionAdd', (reaction) => {
    if (!roles_by_reaction.enabled) {
      return;
    }
  });

  client.on('messageReactionRemove', (reaction) => {
    if (!roles_by_reaction.enabled) {
      return;
    }
  });
};
