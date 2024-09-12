const { SlashCommandBuilder } = require('discord.js');
const { ensureUserExists } = require('../Utils/utlis.js');
const { updateUser } = require('../Utils/mongoLayer');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('build')
    .setDescription('Build a structure on the island')
    .addStringOption(option =>
      option.setName('structure')
        .setDescription('Type of structure to build')
        .setRequired(true)
        .addChoices(
          { name: 'Shelter', value: 'shelter' },
          { name: 'Workshop', value: 'workshop' },
          { name: 'Storage', value: 'storage' }
        )),
  async execute(interaction) {
    const structure = interaction.options.getString('structure');
    const userId = interaction.user.id;
    const username = interaction.user.username;

    // Ensure the user exists
    let user = await ensureUserExists(userId, username);

    // Check if the user has enough resources
    const requiredResources = getRequiredResources(structure);
    const hasResources = Object.entries(requiredResources).every(([key, value]) => user.inventory[key] >= value);

    if (!hasResources) {
      await interaction.reply('You do not have enough resources to build this structure.');
      return;
    }

    // Deduct resources and build the structure
    for (const [key, value] of Object.entries(requiredResources)) {
      user.inventory[key] -= value;
    }

    user.structures.push(structure);
    await updateUser(userId, user); // Save the updated user to the database

    await interaction.reply(`You have successfully built a ${structure}!`);
  }
};

/**
 * Get the required resources for building a structure.
 * @param {string} structure - The type of structure.
 * @returns {Object} The required resources for the structure.
 */
function getRequiredResources(structure) {
  switch (structure) {
    case 'shelter':
      return { wood: 10, stone: 5 };
    case 'workshop':
      return { wood: 20, stone: 10 };
    case 'storage':
      return { wood: 15, stone: 5 };
    default:
      return {};
  }
}
