import { BaseCommandInteraction, Client } from 'discord.js';
import { Command } from '../core/command';

import { version } from '../../package.json';

export const VersionCommand: Command = {
  name: 'version',
  description: 'Get the current bot version',
  type: 'CHAT_INPUT',
  run: async (client: Client, interaction: BaseCommandInteraction) => {
    const content = `The bot is running on version ${version}!`;

    await interaction.followUp({
      ephemeral: true,
      content,
    });
  },
};
