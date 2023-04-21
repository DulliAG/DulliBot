import { BaseCommandInteraction, Client } from 'discord.js';
import { logger } from '../core/log';
import { Command } from '../core/command';
import { handleError } from '../handler/error.handler';

export const ClearCommand: Command = {
  name: 'clear',
  description: 'Clear your current channel',
  type: 'CHAT_INPUT',
  run: async (client: Client, interaction: BaseCommandInteraction) => {
    try {
      const channel = interaction.channel;

      if (
        channel &&
        channel.isText() &&
        (channel.type == 'GUILD_TEXT' ||
          channel.type == 'GUILD_PRIVATE_THREAD' ||
          channel.type == 'GUILD_PUBLIC_THREAD')
      ) {
        const messages = (await channel.messages.fetch()).filter((message) => !message.pinned);

        await channel.bulkDelete(messages, true);

        await interaction.followUp({
          ephemeral: true,
          content: `Der Kanal '${channel.name}' wurde von '${interaction.user.username}' gesäubert!`,
        });

        await logger.log(
          'LOG',
          'ExecuteCommand',
          `Der Kanal '${channel.name}' wurde von '${interaction.user.username}' gesäubert!`
        );
      }
    } catch (error) {
      await handleError(error, 'ExecuteCommand');
    }
  },
};
