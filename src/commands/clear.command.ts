import { LogVariant } from '@dulliag/logger.js';
import { BaseCommandInteraction, Client } from 'discord.js';
import { createLog } from '../Log';
import { Command } from '../core/command';

export const ClearCommand: Command = {
  name: 'clear',
  description: 'Clear your current channel',
  type: 'CHAT_INPUT',
  run: async (client: Client, interaction: BaseCommandInteraction) => {
    const channel = interaction.channel;

    if (
      channel &&
      channel.isText() &&
      (channel.type == 'GUILD_TEXT' ||
        channel.type == 'GUILD_PRIVATE_THREAD' ||
        channel.type == 'GUILD_PUBLIC_THREAD')
    ) {
      channel.messages.fetch().then((msgs) => {
        channel
          .bulkDelete(msgs, true)
          .then(async () => {
            createLog(
              LogVariant.INFORMATION,
              'ExecuteCommand',
              `'${interaction.user.username}' hat den Kanal '${channel.name}' gesäubert!`
            );

            await interaction.followUp({
              ephemeral: true,
              content: `Der Kanal '${channel.name}' wurde von '${interaction.user.username}' gesäubert!`,
            });
          })
          .catch((err) => createLog(LogVariant.ERROR, 'ExecuteCommand', err));
      });
    }
  },
};
