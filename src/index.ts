import dotenv from 'dotenv';
dotenv.config();
import { Client, Intents } from 'discord.js';
import readyListener from './listener/ready.listener';
import errorListener from './listener/error.listener';
import messageListener from './listener/message.listener';
// import reactionListener from './listener/reaction.listener';
import interactionListener from './listener/interaction.listener';
import joinListener from './listener/join.listener';
import quitListener from './listener/quit.listener';

const client = new Client({
  intents: [
    Intents.FLAGS.GUILDS,
    Intents.FLAGS.GUILD_MESSAGES,
    Intents.FLAGS.GUILD_MESSAGE_REACTIONS,
  ],
});

// Register listeners
readyListener(client);
errorListener(client);
messageListener(client);
// reactionListener(client);
interactionListener(client);
joinListener(client);
quitListener(client);

client.login(process.env.TOKEN);
