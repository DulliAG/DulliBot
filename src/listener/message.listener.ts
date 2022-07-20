import { Client } from 'discord.js';
import { log } from '../log';

import { auto_publish, commands } from '../config.json';

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
        .then(() => log('LOG', LOG_CATEGORY, LOG_MESSAGE))
        .catch((err) => log('ERROR', LOG_CATEGORY, err));
      return;
    }
  });
};
