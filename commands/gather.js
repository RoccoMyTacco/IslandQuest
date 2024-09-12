const { SlashCommandBuilder } = require('discord.js');
const { ensureUserExists, getBiomeAtLocation } = require('../Utils/utlis');
const { updateUser } = require('../Utils/mongoLayer');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('gather')
    .setDescription('Gather resources from your current location'),
  async execute(interaction) {
    const userId = interaction.user.id;
    const username = interaction.user.username;
    const serverId = interaction.guild.id; // Get the server ID

    // Ensure the user exists
    let user = await ensureUserExists(userId, serverId, username);

    // Determine the biome based on the player's location
    const biome = getBiomeAtLocation(user.location, user.mapSeed); // Use the stored map seed

    let resourceType;
    let amountGathered = Math.floor(Math.random() * 5) + 1; // Random amount between 1 and 5

    switch (biome) {
      case 'Fields':
        resourceType = 'wood';
        user.resources.wood += amountGathered;
        break;
      case 'Liquid':
        resourceType = 'fish';
        user.resources.fish += amountGathered;
        break;
      case 'Mounts':
        resourceType = 'minerals';
        user.resources.minerals += amountGathered;
        break;
      default:
        await interaction.reply('There are no resources to gather here.');
        return;
    }

    // Update the user in the database
    await updateUser(userId, user);

    await interaction.reply(`You gathered ${amountGathered} ${resourceType}!`);
  }
};
