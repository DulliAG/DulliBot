import {
  Client,
  GuildEmoji,
  Message,
  MessageReaction,
  PartialMessageReaction,
  PartialUser,
  User,
} from 'discord.js';
import { log } from './log';

import { roles_by_reaction, channels } from '../config.json';

const LOG_CATEGORY = 'RolesByReaction';

export default (client: Client) => {
  // Handlers
  const addReactions = (message: Message, reactions: GuildEmoji[]) => {
    while (reactions.length > 0) {
      message.react(reactions[0]);
      reactions.shift();
      setTimeout(() => addReactions(message, reactions), 750);
    }
  };

  const initialMessage = (
    client: Client,
    channelId: string,
    final_message: string,
    emojis: GuildEmoji[]
  ) => {
    client.guilds.cache.forEach((guild) => {
      const channel = guild.channels.cache.find((ch) => ch.id === channelId);

      if (!channel) {
        log(
          'WARNING',
          LOG_CATEGORY,
          `Der Kanal '${channelId}' auf '${guild.name}' wurde nicht gefunden!`
        );
        return;
      }

      if (!channel.isText()) {
        return log('WARNING', LOG_CATEGORY, `Der Kanal '${channel.id}' ist kein Textkanal!`);
      }

      channel.messages.fetch().then((msgs) => {
        if (msgs.size < 1) {
          channel
            .send(final_message)
            .then((message) => addReactions(message, emojis))
            .catch((err) =>
              log('ERROR', LOG_CATEGORY, `Die Nachricht konnte nicht verschickt werden`)
            );
        } else {
          for (const msg of msgs) {
            msg[1].edit(final_message);
            addReactions(msg[1], emojis);
          }
        }
      });
    });
  };

  const getCustomEmoji = (emojiName: string) =>
    client.emojis.cache.find((emoji) => emoji.name === emojiName);

  const handleReaction = (
    reaction: MessageReaction | PartialMessageReaction,
    user: User | PartialUser,
    addRole: boolean
  ) => {
    if (user.id === client.user?.id) return; // Shouldn't be the case either

    const role = roles_by_reaction.reactions.filter(
      (entry) => entry.emoji === reaction.emoji.name
    )[0];
    if (!role) {
      log(
        'ERROR',
        LOG_CATEGORY,
        `Eine Rolle für das Emoji '${reaction.emoji.name}' wurde nicht gefunden! Schaue mal in der '../config.json' nach!`
      );
      return;
    }

    const guildMember = reaction.message.guild?.members.cache.find(
      (guildMember) => guildMember.id === user.id
    );
    if (!guildMember) {
      log(
        'ERROR',
        LOG_CATEGORY,
        `Ein GuildMember für den Benutzer '${user.id}' konnte auf '${reaction.message.guild?.name}' nicht gefunden werden!`
      );
      return;
    }

    try {
      if (addRole) {
        guildMember.roles.add(role.id);
        log(
          'LOG',
          LOG_CATEGORY,
          `'${guildMember.user.tag}' wurde die Rolle '${role.name}' mittels Reaktion hinzugefügt!`
        );
      } else {
        guildMember.roles.remove(role.id);
        log(
          'LOG',
          LOG_CATEGORY,
          `'${guildMember.user.tag}' wurde die Rolle '${role.name}' mittels Reaktion entfernt!`
        );
      }
    } catch (err) {
      log('ERROR', LOG_CATEGORY, `Die Rolle konnte nicht zugewiesen werden!\nGrund: ${err}`);
    }
  };

  // Code
  const reactions: GuildEmoji[] = [];
  let message_text = '```diff\n+ Wähle deine Rollen aus!```\n';
  roles_by_reaction.reactions.forEach((reaction) => {
    const emoji = getCustomEmoji(reaction.emoji);
    const name = reaction.name;

    if (!emoji) {
      log('ERROR', LOG_CATEGORY, `Emoji '${reaction.emoji}' wurde nicht gefunden!`);
    }

    reactions.push(emoji!);
    message_text += `${emoji} ${name}\n`;
  });

  initialMessage(client, channels.roles, message_text, reactions);

  client.on('messageReactionAdd', (reaction, member) => {
    if (reaction.message.channel.id === channels.roles && !member.bot) {
      handleReaction(reaction, member, true);
    }
  });

  client.on('messageReactionRemove', (reaction, member) => {
    if (reaction.message.channel.id === channels.roles && !member.bot) {
      handleReaction(reaction, member, false);
    }
  });
};
