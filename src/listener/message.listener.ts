import { LogVariant } from '@dulliag/logger.js';
import { Client } from 'discord.js';
import { createLog } from '../Log';

import { auto_publish, commands } from '../config.json';

export default (client: Client) => {
  client.on('messageCreate', (message) => {
    // if (
    //   !message.author.bot &&
    //   message.content.substring(0, commands.prefix.length) !== commands.prefix
    // ) {
    //   createLog(
    //     LogVariant.INFORMATION,
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
      let log = `Published message in '${message.channel.name}'!`;
      message
        .crosspost()
        .then(() => createLog(LogVariant.INFORMATION, LOG_CATEGORY, log))
        .catch((err) => createLog(LogVariant.ERROR, LOG_CATEGORY, err));

      return;
    }
  });
};
