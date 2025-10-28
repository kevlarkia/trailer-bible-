const { SlashCommandBuilder } = require('discord.js');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('ground')
    .setDescription('Guided 5-4-3-2-1 grounding + paced breathing'),
  async execute(interaction) {
    const text = [
      'Grounding check-in (save this):',
      '• 5 things you see',
      '• 4 things you can touch',
      '• 3 things you hear',
      '• 2 things you can smell',
      '• 1 thing you can taste',
      '',
      'Breathing: in 4, hold 4, out 6 — repeat x5',
      'If spiraling: name one next step only.'
    ].join('\n');
    await interaction.reply({ content: text, ephemeral: true });
  }
};
