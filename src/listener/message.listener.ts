import { Client } from 'discord.js';
import { logger } from '../core/log';

import { auto_publish } from '../config.json';

export default (client: Client) => {
  client.on('messageCreate', (message) => {
    // if (
    //   !message.author.bot &&
    //   message.content.substring(0, commands.prefix.length) !== commands.prefix
    // ) {
    //   createLog(
    //     "INFORMATION",
    //     'Use command',
    //     `${message.author.username} used the command '${message.content}'!`
    //   );
    // }

    if (
      message.channel.type !== 'DM' &&
      auto_publish.enabled &&
      message.channel.parentId &&
      auto_publish.categories.includes(message.channel.parentId) &&
      (message.channel.type == 'GUILD_NEWS' || message.channel.type == 'GUILD_NEWS_THREAD') &&
      message.crosspostable
    ) {
      const LOG_CATEGORY = 'Autopublish';
      const LOG_MESSAGE = `Published message in '${message.channel.name}'!`;
      message
        .crosspost()
        .then(async () => await logger.log('LOG', LOG_CATEGORY, LOG_MESSAGE))
        .catch(async (err) => await logger.log('ERROR', LOG_CATEGORY, err));
      return;
    }
  });
};
