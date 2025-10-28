## M2 Support Bot (neutral Discord bot)

A non-impersonating Discord companion with grounding, check-ins, and music suggestions.

### 1) Prereqs
- Node.js 18+ (you have Node 22)
- A Discord Application with a Bot user
- Your App ID and Public Key (you provided these)

### 2) Env setup
Copy `.env.example` to `.env` and fill in values:
- `DISCORD_TOKEN` — your Bot token (Developer Portal → Bot → Reset Token)
- `DISCORD_APPLICATION_ID` — `1432546507164225656`
- `DISCORD_PUBLIC_KEY` — `5e915d6217e877d1641afd52aeb8fd4a5fdee66cb0c975f1371a12e0fcb4c53b`
- Optional `DISCORD_GUILD_ID` for faster (guild) slash-command registration

### 3) Bot intents (Developer Portal → Bot)
- Privileged Gateway Intents: enable “Message Content Intent” if you want text triggers (e.g., typing "ground me").
- Otherwise, slash commands work without it.

### 4) Install and deploy commands
```bash
npm install
# Guild-scoped (fast) if you set DISCORD_GUILD_ID
npm run deploy
# Without GUILD_ID, commands are global and may take up to 1 hour to appear
```

### 5) Invite the bot
Use the OAuth2 URL Generator (scopes: bot, applications.commands; perms: Send Messages, Read Message History, View Channels), or this link with minimal permissions:

[Invite M2 Support](https://discord.com/api/oauth2/authorize?client_id=1432546507164225656&scope=bot%20applications.commands&permissions=84992)

### 6) Run the bot
```bash
npm start
```
The bot will set presence to "here to help" (configurable via `BOT_STATUS`).

### 7) Try it out
- `/help` — shows available commands
- `/checkin mood:6 note:"long day"`
- `/ground` — 5-4-3-2-1 steps + breathing
- `/music context:calm` — quick suggestion
- Text triggers (if Message Content Intent enabled): type `ground me` or `help`

### Notes
- Never commit or share your `DISCORD_TOKEN`.
- Public Key and Application ID are safe to share; token is secret.
