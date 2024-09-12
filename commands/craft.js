const { SlashCommandBuilder } = require('discord.js');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('craft')
    .setDescription('Craft an item')
    .addStringOption(option =>
      option.setName('item')
        .setDescription('Item to craft')
        .setRequired(true)),
  async execute(interaction) {
    // Implement crafting logic here
    await interaction.reply('Crafting is not yet implemented.');
  }
};
