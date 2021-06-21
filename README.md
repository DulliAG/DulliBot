<p align="center">
  <img src="https://files.dulliag.de/share/qr-code.png" width="240px" height="auto">
</p>

<h1 align="center">
  DulliBot
</h1>

## :rocket: Features

- [x] Configuration via JSON-File
- [x] Welcome message(for server & user)
- [x] Clear channel
- [x] Roles by reaction
- [x] [Server stats](https://files.dulliag.de/share/Discord_AL5lriRcmD.png)
- [x] Kick {Member} {Reason}
- [x] Ban {Member} {Reason}
- [x] Read an RSS-Feed
  - Done by Discord.RSS
- [x] Get stock informations(for specific stocks)

## :calendar: Planned features

#### :chart_with_upwards_trend: Stocks

- [ ] Add graph to daily reports
- [ ] Add graph with current
- [ ] Weekly Reports
  - Development of a share summarized in a graph
- [ ] Get a list of all subscribed stocks
- [ ] Add & delete stocks via command

#### :warning: Warn system

- [ ] Warn an player
- [ ] Kick or ban player after an amount of warns

## :wrench: Installation

_**!!! Make sure you have registered an Discord-Bot !!!**_

1. Clone the Repository `git clone https://github.com/tklein1801/Discord-Bot.git`

2. Go into the bot directory `cd discord-bot/`

3. Install the required dependencies `npm install`

4. Create an .env-file containing the Discord bot token

```
TOKEN=DISCORD_BOT_TOKEN
```

5. Update the existing [config.json](./src/config.json)

6. Now you can follow the [Hosting](#hosting) steps

## :gear: Hosting

**Linux**

_Make sure you have [cloned](#installation) the Repository before this steps_

1. Run the command `bash createScreen.sh`

_NOTE: Make sure you have `screen` installed or install it with `apt-get install screen`_

## :postal_horn: Commands

_To execute an command you need to add the prefix `!`_

| Command | Action                       |
| ------- | ---------------------------- |
| `clear` | Deletes all channel-messages |
| `ban`   | Ban an player                |
| `kick`  | Kick an player               |

## :link: Used Ressources

[DiscordJS](https://discord.com/developers/docs/intro)
[Cron](https://www.npmjs.com/package/cron)
