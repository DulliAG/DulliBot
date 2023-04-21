import { BaseCommandInteraction, ChatInputApplicationCommandData, Client } from 'discord.js';
import { ClearCommand } from '../commands/clear.command';
import { VersionCommand } from '../commands/version.command';
import { PanthorLifeCommand } from '../commands/realliferpg-mod.command';

export interface Command extends ChatInputApplicationCommandData {
  run: (client: Client, interaction: BaseCommandInteraction) => void;
}

export const Commands: Command[] = [ClearCommand, VersionCommand, PanthorLifeCommand];
