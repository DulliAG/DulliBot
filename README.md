<p align="center">
  <img src="https://files.dulliag.de/share/qr-code.png" width="240px" height="auto">
</p>

<h1 align="center">
  DAG-Discord-Bot
</h1>

# Features

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

# Installation

_!!! Make sure you have registered an Discord-Bot !!!_

1. Clone the Repository `git clone https://github.com/tklein1801/Discord-Bot.git`

2. Go into the bot directory `cd discord-bot/`

3. Install the required dependencies `npm install`

4. Create an config.json like this

_There are only stocks from nasdaq supported_

```
{
  "token": "ENTER_BOT_TOKEN",
  "roles": {
    "gruender": "ENTER_OWNER_ROLE",
    "coding": "ENTER_DEVELOPER_ROLE",
    "guest": "ENTER_GUEST_ROLE",
    "realliferpg": "ENTER_ROLE_ID",
    "clipperino": "ENTER_ROLE_ID",
    "eft": "EMTER_ROLE_ID",
    "minecraft": "ENTER_ROLE_ID"
  },
  "channels": {
    "welcome": "ENTER_CHANNEL_ID",
    "roles": "ENTER_CHANNEL_ID",
    "botDevelopment": "ENTER_CHANNEL_ID",
    "stocks": "ENTER_CHANNEL_ID",
    "stats": {
      "member": "ENTER_CHANNEL_ID",
      "bots": "ENTER_CHANNEL_ID"
    }
  },
  "stocks": [
    {
      "company": "Tesla",
      "short": "TSLA"
    },
    {
      "company": "Apple",
      "short": "AAPL"
    },
    {
      "company": "Facebook",
      "short": "FB"
    },
    {
      "company": "Microsoft",
      "short": "MSFT"
    }
  ]
}
```

5. Now you can follow the [Hosting](#hosting) steps

# Hosting

**Linux**
_Make sure you have [cloned](#installation) the Repository before this steps_

1. Run the command `bash createScreen.sh`
   _NOTE: You need `screen` to run this SHELL-Script_

# Commands

_To execute an command you need to add the prefix `!`_

| Command  | Action                       |
| -------- | ---------------------------- |
| `clear`  | Deletes all channel-messages |
| `ban`    | Ban an player                |
| `kick`   | Kick an player               |
| `stocks` | Get the current share price  |
