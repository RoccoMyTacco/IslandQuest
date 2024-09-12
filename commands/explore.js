const { SlashCommandBuilder } = require('discord.js');
const { ensureUserExists, startExploration } = require('../Utils/utlis'); // Ensure you have startExploration imported
const { updateUser } = require('../Utils/mongoLayer');
const { setCache } = require('../Utils/cache'); // Assuming cache module exists

module.exports = {
  data: new SlashCommandBuilder()
    .setName('explore')
    .setDescription('Explore a new area by moving in a specific direction over an extended period')
    .addStringOption(option =>
      option.setName('direction')
        .setDescription('Direction to move')
        .setRequired(true)
        .addChoices(
          { name: 'North', value: 'north' },
          { name: 'South', value: 'south' },
          { name: 'East', value: 'east' },
          { name: 'West', value: 'west' }
        ))
    .addIntegerOption(option =>
      option.setName('hours')
        .setDescription('Time in hours to explore in the chosen direction')
        .setRequired(true)),
  async execute(interaction) {
    const direction = interaction.options.getString('direction');
    const hours = interaction.options.getInteger('hours');
    const userId = interaction.user.id;
    const username = interaction.user.username;
    const serverId = interaction.guild.id; // Get the server ID

    // Ensure the user exists
    let user;
    try {
      user = await ensureUserExists(userId, serverId, username);
    } catch (error) {
      console.error('Error fetching or creating user:', error);
      await interaction.reply('An error occurred while starting your exploration. Please try again.');
      return;
    }

    if (!user) {
      await interaction.reply('Could not retrieve your user data. Please try again.');
      return;
    }

    // Check if the user is already exploring
    if (user.status.exploring) {
      await interaction.reply('You are already exploring. Please wait until your current exploration is complete.');
      return;
    }

    // Defer the reply to acknowledge the command
    await interaction.deferReply();

    // Notify the user that exploration has started
    await interaction.editReply(`You have begun exploring ${direction} for ${hours} hours. Check back later to see your new position!`);

    // Calculate the total exploration time in milliseconds
    const totalExplorationTime = hours * 60 * 60 * 1000; // Convert hours to milliseconds

    // Use the startExploration function to handle setting up the exploration
    await startExploration(user, direction, hours, totalExplorationTime);

    // Update user in the database and cache
    await updateUser(userId, serverId, user);
    setCache(`${serverId}_${userId}`, user); // Update cache with new status

    // Simulate exploration in the background
    setTimeout(async () => {
      let updatedUser;
      try {
        // Fetch the latest user data
        updatedUser = await ensureUserExists(userId, serverId, username);

        if (!updatedUser) {
          throw new Error('User data could not be fetched.');
        }

        // Determine new location based on direction
        let newX = updatedUser.location.x;
        let newY = updatedUser.location.y;

        switch (direction) {
          case 'north':
            newY = Math.max(0, newY - hours); // Move north (up)
            break;
          case 'south':
            newY = Math.min(99, newY + hours); // Move south (down)
            break;
          case 'east':
            newX = Math.min(99, newX + hours); // Move east (right)
            break;
          case 'west':
            newX = Math.max(0, newX - hours); // Move west (left)
            break;
        }

        // Update user's location
        updatedUser.location.x = newX;
        updatedUser.location.y = newY;

        console.log(`User moved to new location: x = ${newX}, y = ${newY}`);

        // Clear exploration status
        updatedUser.status.exploring = null;

        // Update user in the database and cache
        await updateUser(userId, serverId, updatedUser);
        setCache(`${serverId}_${userId}`, updatedUser); // Update cache with new location and status

        // Optionally notify the user once the movement is complete
      } catch (error) {
        console.error('Error completing exploration:', error);
      }
    }, totalExplorationTime); // The exploration happens after the specified real-world time
  }
};
