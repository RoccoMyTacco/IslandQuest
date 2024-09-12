const { SlashCommandBuilder } = require('discord.js');
const { ensureUserExists } = require('../Utils/utlis');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('checkexplore')
    .setDescription('Check the progress of your ongoing exploration'),
  async execute(interaction) {
    const userId = interaction.user.id;
    const username = interaction.user.username;
    const serverId = interaction.guild.id; // Get the server ID

    // Ensure the user exists
    let user;
    try {
      user = await ensureUserExists(userId, serverId, username);
    } catch (error) {
      console.error('Error fetching user:', error);
      await interaction.reply('An error occurred while checking your exploration status. Please try again.');
      return;
    }

    // Check if the user object is valid and exploring status is set
    if (!user || !user.status || !user.status.exploring) {
      await interaction.reply('You are not currently exploring.');
      return;
    }

    const { direction, startTime, endTime, duration } = user.status.exploring;
    const currentTime = Date.now();

    // Calculate remaining time safely
    let remainingTime = endTime - currentTime;
    if (remainingTime < 0) {
      remainingTime = 0; // Ensure remaining time is not negative
    }

    const hoursRemaining = (remainingTime / (60 * 60 * 1000)).toFixed(2);

    // Display the exploration progress
    await interaction.reply(`You are currently exploring ${direction} for ${duration} hours.\nTime remaining: ${hoursRemaining} hours.`);
  }
};
