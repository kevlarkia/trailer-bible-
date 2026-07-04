# AGENTS.md

## Cursor Cloud specific instructions

This repo bundles three loosely-related pieces. Only the Discord bot is wired into `package.json`.

### 1. M2 Support Bot (primary product — `src/`, `scripts/deploy-commands.js`)
A `discord.js` v14 Discord bot (Node.js, CommonJS). Standard commands live in `package.json` (`npm start`, `npm run deploy`, `npm run lint` is a no-op stub — no linter/tests/build configured).

Non-obvious caveats:
- Running end-to-end requires a real `DISCORD_TOKEN` (Discord Gateway login). `npm start` and `npm run deploy` intentionally `process.exit(1)` early when `DISCORD_TOKEN` (and, for deploy, `DISCORD_APPLICATION_ID`) is missing — this is a guard, not a bug. There is no local Discord emulator, so a live token/bot is needed for a real end-to-end run. Provide it via a `.env` file (copy `.env.example`; `.env` is git-ignored) or environment variables.
- The `/categorize` slash command and the free-text categorization template trigger require `OPENAI_API_KEY`; without it they respond gracefully with an "AI is not configured" message. All other commands (`/help`, `/checkin`, `/ground`, `/music`) and the grounding text triggers work with no OpenAI key.
- Free-text triggers (e.g. "ground me", the categorization template) additionally require the "Message Content Intent" to be enabled in the Discord Developer Portal; slash commands work without it.
- Command modules in `src/commands/*.js` are plain objects (`{ data, execute }`), so their logic can be exercised without Discord by calling `execute()` with a mock interaction — useful for verifying bot behavior without a token.

### 2. Phoenix Crown 3D viewer (`public/phoenix-crown-3d.html`)
A standalone Three.js/WebGL page with no build step. It loads Three.js from a CDN, so it needs internet access. Serve `public/` statically (e.g. `python3 -m http.server 8080` from `public/`, then open `http://localhost:8080/phoenix-crown-3d.html`) or open the file directly in a browser.

### 3. Braille Plinko generator (`scripts/braille_plinko_core.py`)
A standalone Python/Pillow library with no entrypoint and hardcoded font paths (`/home/claude/fonts/*.ttf`). Not part of the bot; requires `pip install Pillow` plus font files to render anything. Not needed to run or test the bot or the 3D viewer.
