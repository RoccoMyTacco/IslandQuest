const { SlashCommandBuilder } = require('discord.js');
const { ensureUserExists } = require('../Utils/utlis');
const { loadImage, createCanvas } = require('canvas');
const path = require('path');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('map')
    .setDescription('View your current location on the map'),
  async execute(interaction) {
    const userId = interaction.user.id;
    const username = interaction.user.username;
    const serverId = interaction.guild.id; // Get the server ID

    // Ensure the user exists
    let user = await ensureUserExists(userId, serverId, username);

    // Load the original map image
    const originalMapImagePath = user.mapFilePath;
    const mapImage = await loadImage(originalMapImagePath);

    // Create a canvas to redraw the map with the updated player position
    const canvas = createCanvas(mapImage.width, mapImage.height);
    const ctx = canvas.getContext('2d');
    ctx.drawImage(mapImage, 0, 0);

    // Draw the player marker at the new position
    const TILE_SIZE = 50; // Define your tile size
    const markerSize = TILE_SIZE / 2; // Increase marker size for better visibility
    ctx.fillStyle = 'red'; // Marker color
    ctx.beginPath();
    ctx.arc(user.location.x * TILE_SIZE + TILE_SIZE / 2, user.location.y * TILE_SIZE + TILE_SIZE / 2, markerSize, 0, Math.PI * 2);
    ctx.fill();

    // Convert the updated canvas to a buffer
    const updatedMapBuffer = canvas.toBuffer('image/png');

    // Send the updated map to the user
    await interaction.reply({
      content: `Here is your current location:`,
      files: [{ attachment: updatedMapBuffer, name: 'updated_map.png' }]
    });
  }
};
