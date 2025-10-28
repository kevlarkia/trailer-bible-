const { SlashCommandBuilder } = require('discord.js');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('checkin')
    .setDescription('Quick mood check-in to name and normalize your state')
    .addIntegerOption(opt =>
      opt.setName('mood')
        .setDescription('Mood 1 (low) to 10 (high)')
        .setMinValue(1)
        .setMaxValue(10)
        .setRequired(true)
    )
    .addStringOption(opt =>
      opt.setName('note')
        .setDescription('Optional note or context')
        .setMaxLength(200)
        .setRequired(false)
    ),
  async execute(interaction) {
    const mood = interaction.options.getInteger('mood');
    const note = interaction.options.getString('note');

    let support = '';
    if (mood <= 3) {
      support = 'Heavy day. You matter. Try /ground and drink water.';
    } else if (mood <= 6) {
      support = 'Not easy, not impossible. One thing at a time.';
    } else if (mood <= 8) {
      support = 'Solid! Keep doing what helps. A short break can protect momentum.';
    } else {
      support = 'High energy. If scattered, set one priority and a 20-min timer.';
    }

    const lines = [
      `Mood: ${mood}/10`,
      note ? `Note: ${note}` : undefined,
      support
    ].filter(Boolean);

    await interaction.reply({ content: lines.join('\n'), ephemeral: true });
  }
};
