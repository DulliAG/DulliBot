import { BaseCommandInteraction, Client } from 'discord.js';
import { Commands } from '../core/command';
import { log } from '../core/log';

const LOG_CATEGORY = 'ExecuteSlashCommand';

const handleSlashCommand = async (client: Client, interaction: BaseCommandInteraction) => {
  const slashCommand = Commands.find((cmd) => cmd.name === interaction.commandName);

  if (!slashCommand) {
    interaction.followUp({ content: "Command isn't a slash command" });
    log('WARNING', LOG_CATEGORY, "Command isn't a slash command");
    return;
  }

  log(
    'LOG',
    LOG_CATEGORY,
    `${interaction.user.tag} executed the /-command '${interaction.commandName}'`
  );

  await interaction.deferReply();

  slashCommand.run(client, interaction);
};

export default (client: Client) => {
  client.on('interactionCreate', async (interaction) => {
    if (interaction.isCommand() || interaction.isContextMenu()) {
      await handleSlashCommand(client, interaction);
    }
  });
};
