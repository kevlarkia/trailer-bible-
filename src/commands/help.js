const { SlashCommandBuilder } = require('discord.js');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('help')
    .setDescription('Show available support commands'),
  async execute(interaction) {
    const helpText = [
      '**M2 Support — Commands**',
      '/help — show this help',
      '/checkin mood:<1-10> note:<optional> — quick mood check-in',
      '/ground — 5-4-3-2-1 grounding steps + breathing',
      '/music context:<vibe|focus|calm|energy|grief> — a song suggestion'
    ].join('\n');
    await interaction.reply({ content: helpText, ephemeral: true });
  }
};
