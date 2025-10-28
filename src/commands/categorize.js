const { SlashCommandBuilder } = require('discord.js');
const { completeCategorization } = require('../ai');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('categorize')
    .setDescription('Categorize/summarize a block using your template + trigger')
    .addStringOption(opt =>
      opt.setName('keyword')
        .setDescription('Trigger keyword used in your block (e.g., ANALYZE)')
        .setRequired(true)
    )
    .addStringOption(opt =>
      opt.setName('task')
        .setDescription('TASK line (e.g., Categorize by ... min X max Y)')
        .setRequired(true)
    )
    .addStringOption(opt =>
      opt.setName('strict_format')
        .setDescription('STRICT OUTPUT FORMAT text block')
        .setRequired(true)
    )
    .addStringOption(opt =>
      opt.setName('data')
        .setDescription('Data to categorize (paste your list)')
        .setRequired(true)
    ),
  async execute(interaction) {
    const keyword = interaction.options.getString('keyword');
    const task = interaction.options.getString('task');
    const strict = interaction.options.getString('strict_format');
    const data = interaction.options.getString('data');

    const prompt = [
      task,
      '',
      'STRICT OUTPUT FORMAT: Provide ONLY the categorized list and a summary. DO NOT include any commentary, notes, or introductions. Use the following Markdown structure precisely:',
      '',
      strict,
      '',
      `TRIGGER WORD: ${keyword}`,
      '',
      data
    ].join('\n');

    await interaction.deferReply({ ephemeral: true });
    try {
      const out = await completeCategorization(prompt);
      // Ensure we reply with markdown as-is
      await interaction.editReply(out);
    } catch (err) {
      console.error(err);
      await interaction.editReply('AI is not configured. Set OPENAI_API_KEY and try again.');
    }
  }
};
