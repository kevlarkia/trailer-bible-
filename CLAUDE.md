# CLAUDE.md — M2 Support Bot

AI assistant reference for the **M2 Support Bot** repository.

---

## Project Overview

A neutral, non-impersonating Discord companion bot focused on mental wellness.
It provides grounding exercises, mood check-ins, music suggestions, and AI-powered
text categorization. The bot is intentionally non-persona-based — it does not role-play
as a human or a named character.

**Package name:** `m2-support-bot` | **Entry point:** `src/index.js`

---

## Repository Structure

```
.
├── src/
│   ├── index.js              # Bot entry point: client init, event handlers
│   ├── ai.js                 # OpenAI wrapper (completeCategorization)
│   ├── templateTrigger.js    # Text-block trigger parser (parseTriggerBlock)
│   └── commands/             # One file per slash command (auto-loaded)
│       ├── checkin.js        # /checkin — mood 1-10 with optional note
│       ├── ground.js         # /ground — 5-4-3-2-1 grounding + breathing
│       ├── help.js           # /help — lists available commands
│       ├── music.js          # /music — song suggestion by context/vibe
│       └── categorize.js     # /categorize — AI categorization via slash cmd
├── scripts/
│   └── deploy-commands.js    # Registers slash commands with Discord API
├── public/
│   └── phoenix-crown-3d.html # Standalone Three.js 3D model viewer (unrelated to bot)
├── .env.example              # Template for required environment variables
├── package.json
└── README.md
```

---

## Tech Stack

| Layer | Technology |
|---|---|
| Runtime | Node.js ≥ 18 (tested on 22) |
| Discord SDK | discord.js v14 |
| AI / LLM | OpenAI Node SDK v4 (optional) |
| Config | dotenv |
| Module system | CommonJS (`"type": "commonjs"`) |

No build step, no TypeScript, no test framework is currently configured.

---

## Environment Variables

Copy `.env.example` to `.env`. Never commit `.env`.

| Variable | Required | Default | Description |
|---|---|---|---|
| `DISCORD_TOKEN` | Yes | — | Bot token from Discord Developer Portal |
| `DISCORD_APPLICATION_ID` | Yes | `1432546507164225656` | App ID |
| `DISCORD_GUILD_ID` | No | — | Set for fast guild-scoped command registration during dev |
| `DISCORD_PUBLIC_KEY` | No | (in example) | Public key for webhook-mode signature verification |
| `BOT_STATUS` | No | `here to help` | Text shown in bot presence |
| `OPENAI_API_KEY` | No | — | Required to enable AI categorization features |
| `OPENAI_MODEL` | No | `gpt-4o-mini` | OpenAI model for categorization |

---

## Development Workflows

### Install and run

```bash
npm install
npm start        # Starts the bot (node src/index.js)
```

### Register slash commands with Discord

```bash
# Fast: guild-scoped (set DISCORD_GUILD_ID first)
npm run deploy

# Slow: global (up to 1 hour to propagate, no GUILD_ID needed)
npm run deploy
```

`scripts/deploy-commands.js` auto-discovers all command files from `src/commands/`,
calls `.toJSON()` on each `SlashCommandBuilder`, and pushes them via Discord's REST API.

### No linter or test suite

`npm run lint` is a no-op placeholder. There are no automated tests.
When adding features, manually test in a Discord server.

---

## Architecture & Key Conventions

### Command auto-loading (`src/index.js:31-43`)

All `.js` files in `src/commands/` are loaded at startup. A file is registered as a
command if it exports both `data` (a `SlashCommandBuilder`) and `execute` (async function).
**Adding a new command:** create a new file in `src/commands/` following this pattern — no
other registration is needed in `index.js`.

### Slash command pattern

```js
const { SlashCommandBuilder } = require('discord.js');
module.exports = {
  data: new SlashCommandBuilder()
    .setName('commandname')
    .setDescription('Description'),
  async execute(interaction) {
    await interaction.reply({ content: '...', ephemeral: true });
  }
};
```

- All replies are **ephemeral** (only visible to the invoking user) by convention.
- For async AI calls, use `interaction.deferReply({ ephemeral: true })` then `interaction.editReply(...)`.

### Text-based triggers (`src/index.js:74-118`)

The `MessageCreate` handler runs lightweight heuristics:
1. **Template trigger** — calls `parseTriggerBlock()` to detect a structured block with
   `TRIGGER WORD: <KEYWORD>`. If valid, forwards the full message to `completeCategorization()`.
2. **Hardcoded phrases** — detects `"ground me"` or `"panic"` and replies with grounding steps.
3. **"help" prefix** — provides a minimal text fallback.

Requires the **Message Content** privileged intent to be enabled in the Developer Portal.

### AI integration (`src/ai.js`)

- `completeCategorization(prompt)` — sends a user prompt to OpenAI with a strict system
  message (`"Output ONLY the requested markdown structure"`), temperature 0.2, max 800 tokens.
- The OpenAI client is only instantiated if `OPENAI_API_KEY` is present. Calling
  `completeCategorization` without the key throws, and callers are expected to catch and
  reply with a friendly error message.

### Template trigger parser (`src/templateTrigger.js`)

`parseTriggerBlock(text)` scans for a line matching `TRIGGER WORD: <KEYWORD>` (case-insensitive)
and returns `{ keyword, payload }` where `payload` is everything after that line.
The handler in `index.js` additionally checks that `payload`'s first non-empty line exactly
equals the keyword before executing.

---

## Slash Commands Reference

| Command | Options | Behaviour |
|---|---|---|
| `/help` | — | Lists all commands (ephemeral) |
| `/checkin` | `mood` (1–10, required), `note` (string, optional) | Returns mood tier message (ephemeral) |
| `/ground` | — | 5-4-3-2-1 grounding steps + breathing instructions (ephemeral) |
| `/music` | `context` (vibe/focus/calm/energy/grief, required) | Random song from curated pool (ephemeral) |
| `/categorize` | `keyword`, `task`, `strict_format`, `data` (all required) | Builds prompt, defers, calls AI, edits reply (ephemeral) |

---

## Unrelated Asset

`public/phoenix-crown-3d.html` is a standalone Three.js 3D model viewer for a Phoenix Flame
Crown. It has no runtime connection to the Discord bot. Open directly in a browser; requires
WebGL and an internet connection (Three.js loaded from CDN).

---

## Security Notes

- **Never commit `DISCORD_TOKEN`** — it grants full bot control.
- `DISCORD_PUBLIC_KEY` and `DISCORD_APPLICATION_ID` are non-secret and safe to commit/share.
- Bot replies are all ephemeral; no user data is stored or logged beyond the console.
- The `MessageContent` intent exposes message text — only enable if the text-trigger feature is needed.

---

## Adding a New Command — Checklist

1. Create `src/commands/<name>.js` following the slash command pattern above.
2. Export `{ data, execute }`.
3. Run `npm run deploy` to register the new command with Discord.
4. Test in a guild before removing `DISCORD_GUILD_ID` for global rollout.
5. Add the command to the `/help` command's `helpText` array (`src/commands/help.js:8-14`).
