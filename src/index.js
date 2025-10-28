require('dotenv').config();
const { Client, GatewayIntentBits, Partials, ActivityType, Events, Collection } = require('discord.js');
const path = require('node:path');
const fs = require('node:fs');
const { parseTriggerBlock } = require('./templateTrigger');
const { completeCategorization } = require('./ai');

const token = process.env.DISCORD_TOKEN;
const applicationId = process.env.DISCORD_APPLICATION_ID;

if (!token) {
  console.error('Missing DISCORD_TOKEN in environment.');
  process.exit(1);
}
if (!applicationId) {
  console.warn('Warning: DISCORD_APPLICATION_ID not set. Some features (e.g., deploy) require it.');
}

// Create client with privileged intents kept minimal for safety
const client = new Client({
  intents: [
    GatewayIntentBits.Guilds,
    GatewayIntentBits.GuildMessages,
    GatewayIntentBits.MessageContent // Required if you want simple text heuristics; can be removed if only slash commands
  ],
  partials: [Partials.Channel]
});

client.commands = new Collection();

function loadCommands() {
  const commandsPath = path.join(__dirname, 'commands');
  if (!fs.existsSync(commandsPath)) return;
  const commandFiles = fs.readdirSync(commandsPath).filter(f => f.endsWith('.js'));
  for (const file of commandFiles) {
    const command = require(path.join(commandsPath, file));
    if (command && command.data && command.execute) {
      client.commands.set(command.data.name, command);
    }
  }
}

loadCommands();

client.once(Events.ClientReady, (c) => {
  console.log(`Logged in as ${c.user.tag}`);
  const activityText = process.env.BOT_STATUS || 'here to help';
  c.user.setPresence({
    activities: [{ name: activityText, type: ActivityType.Listening }],
    status: 'online'
  });
});

client.on(Events.InteractionCreate, async (interaction) => {
  try {
    if (!interaction.isChatInputCommand()) return;
    const command = client.commands.get(interaction.commandName);
    if (!command) return;
    await command.execute(interaction);
  } catch (err) {
    console.error('Error handling interaction:', err);
    if (interaction.isRepliable()) {
      const content = 'Something went wrong. Please try again.';
      if (interaction.deferred || interaction.replied) {
        await interaction.followUp({ content, ephemeral: true }).catch(() => {});
      } else {
        await interaction.reply({ content, ephemeral: true }).catch(() => {});
      }
    }
  }
});

// Optional: lightweight text triggers (non-impersonating, supportive)
client.on(Events.MessageCreate, async (message) => {
  try {
    if (message.author.bot) return;
    const content = message.content;
    const lower = content.toLowerCase();

    // Categorization template trigger parsing
    const block = parseTriggerBlock(content);
    if (block && block.keyword && block.payload) {
      // Only act if the very first non-empty line equals the keyword (exact match)
      const firstNonEmpty = block.payload.split(/\r?\n/).find(l => l.trim().length > 0) || '';
      if (firstNonEmpty.trim() === block.keyword) {
        try {
          const prompt = content; // Pass the full block to AI
          const out = await completeCategorization(prompt);
          await message.reply(out.slice(0, 1900)); // keep under Discord 2000 char limit
          return;
        } catch (e) {
          await message.reply('AI not configured. Add OPENAI_API_KEY to run categorization.');
          return;
        }
      }
    }

    // Gentle trigger phrases
    if (lower.includes('ground me') || lower.includes('panic')) {
      await message.reply({
        content: [
          'Grounding check-in:',
          '1) Name 5 things you see',
          '2) 4 things you can touch',
          '3) 3 things you hear',
          '4) 2 things you can smell',
          '5) 1 thing you can taste',
          'Breathe in 4, hold 4, out 6. I am here.'
        ].join('\n')
      });
      return;
    }
    if (lower.startsWith('help')) {
      await message.reply('Try /help or /ground. For AI categorization, paste your block and ensure the first line after TRIGGER WORD is the keyword.');
    }
  } catch (err) {
    console.error('Error in messageCreate:', err);
  }
});

client.login(token);
