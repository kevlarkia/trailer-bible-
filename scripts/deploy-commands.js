require('dotenv').config();
const { REST, Routes } = require('discord.js');
const fs = require('node:fs');
const path = require('node:path');

const token = process.env.DISCORD_TOKEN;
const applicationId = process.env.DISCORD_APPLICATION_ID;
const guildId = process.env.DISCORD_GUILD_ID; // optional for dev

if (!token || !applicationId) {
  console.error('Missing DISCORD_TOKEN or DISCORD_APPLICATION_ID.');
  process.exit(1);
}

function loadCommandJson() {
  const commandsPath = path.join(__dirname, '..', 'src', 'commands');
  const files = fs.readdirSync(commandsPath).filter(f => f.endsWith('.js'));
  const commands = [];
  for (const file of files) {
    const cmd = require(path.join(commandsPath, file));
    if (cmd && cmd.data) {
      commands.push(cmd.data.toJSON());
    }
  }
  return commands;
}

async function deploy() {
  const rest = new REST({ version: '10' }).setToken(token);
  const body = loadCommandJson();

  try {
    if (guildId) {
      console.log(`Refreshing ${body.length} guild commands for ${guildId}...`);
      await rest.put(Routes.applicationGuildCommands(applicationId, guildId), { body });
      console.log('Guild commands deployed.');
    } else {
      console.log(`Refreshing ${body.length} global commands...`);
      await rest.put(Routes.applicationCommands(applicationId), { body });
      console.log('Global commands deployed (can take up to 1 hour to appear).');
    }
  } catch (err) {
    console.error(err);
    process.exit(1);
  }
}

deploy();
