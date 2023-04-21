import { BaseCommandInteraction, Client } from 'discord.js';
import { handleError } from '../handler/error.handler';
import { Command } from '../core/command';
import PanthorLifeUpdate from '../core/panthor-life-update';

export const PanthorLifeCommand: Command = {
  name: 'mod-update',
  description: 'Check for a new Panthor Life update',
  type: 'CHAT_INPUT',
  run: async (client: Client, interaction: BaseCommandInteraction) => {
    try {
      PanthorLifeUpdate(client);

      await interaction.followUp({
        ephemeral: true,
        content: `Die Prüfung wurde abgeschlossen!`,
      });
    } catch (error) {
      await handleError(error, 'ExecuteCommand');
    }
  },
};
