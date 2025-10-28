const { SlashCommandBuilder } = require('discord.js');

const SUGGESTIONS = {
  calm: [
    'Cigarettes After Sex — Apocalypse',
    'JP Saxe — If the World Was Ending',
    'Sarah Cothran — As the World Caves In'
  ],
  focus: [
    'Two Door Cinema Club — What You Know',
    'Baio — Sister of Pearl',
    'Dayglow — Can I Call You Tonight?'
  ],
  vibe: [
    'Lauv — I Like Me Better',
    'Calvin Harris — By Your Side',
    'Jess Glynne — Hold My Hand'
  ],
  energy: [
    'Lady Gaga — Scheiße',
    'Tove Lo — Cool Girl',
    'MARINA — Primadonna'
  ],
  grief: [
    'Jhené Aiko — W.A.Y.S.',
    'Mario — Let Me Love You',
    'Ne-Yo — So Sick'
  ]
};

function pick(arr) {
  return arr[Math.floor(Math.random() * arr.length)];
}

module.exports = {
  data: new SlashCommandBuilder()
    .setName('music')
    .setDescription('Get a song suggestion for your context')
    .addStringOption(opt =>
      opt.setName('context')
        .setDescription('Pick a context')
        .addChoices(
          { name: 'vibe', value: 'vibe' },
          { name: 'focus', value: 'focus' },
          { name: 'calm', value: 'calm' },
          { name: 'energy', value: 'energy' },
          { name: 'grief', value: 'grief' }
        )
        .setRequired(true)
    ),
  async execute(interaction) {
    const context = interaction.options.getString('context');
    const pool = SUGGESTIONS[context] || SUGGESTIONS.vibe;
    const suggestion = pick(pool);
    await interaction.reply({ content: `Try this: ${suggestion}`, ephemeral: true });
  }
};
