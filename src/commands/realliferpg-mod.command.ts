import { BaseCommandInteraction, Client } from 'discord.js';
import { Command } from '../core/command';
import RealliferpgUpdates from '../core/realliferpg-updates';

export const ReallifeRpgCommand: Command = {
  name: 'mod-update',
  description: 'Check for a new ReallifeRPG update',
  type: 'CHAT_INPUT',
  run: async (client: Client, interaction: BaseCommandInteraction) => {
    RealliferpgUpdates(client);

    await interaction.followUp({
      ephemeral: true,
      content: `Die Prüfung wurde abgeschlossen!`,
    });
  },
};
