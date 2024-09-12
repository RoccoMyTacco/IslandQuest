const { SlashCommandBuilder } = require('discord.js');
const { ensureUserExists } = require('../Utils/utlis');
const { updateUser } = require('../Utils/mongoLayer');
const { aStarPathfinding } = require('../Utils/pathfinding');
const { generateMapFromSeed, worldToGrid } = require('../Utils/mapGenerator');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('moveto')
    .setDescription('Move directly to a specific coordinate on the map avoiding obstacles')
    .addIntegerOption(option =>
      option.setName('x')
        .setDescription('Target X coordinate')
        .setRequired(true))
    .addIntegerOption(option =>
      option.setName('y')
        .setDescription('Target Y coordinate')
        .setRequired(true)),
  async execute(interaction) {
    const targetX = interaction.options.getInteger('x');
    const targetY = interaction.options.getInteger('y');
    const userId = interaction.user.id;
    const username = interaction.user.username;
    const serverId = interaction.guild.id; // Get the server ID

    // Ensure the user exists
    let user = await ensureUserExists(userId, serverId, username);

    // Defer the reply to acknowledge the command
    await interaction.deferReply();

    // Validate target coordinates
    if (targetX < 0 || targetY < 0 || targetX > 99 || targetY > 99) { // Adjust bounds according to your map size
      await interaction.editReply('Invalid coordinates. Please specify coordinates within the map boundaries.');
      return;
    }

    try {
      // Generate the map from seed
      const world = generateMapFromSeed(user.mapSeed, 100, 100); // Assume map is 100x100 for this example

      // Convert world to a grid
      const grid = worldToGrid(world);

      // Perform A* pathfinding
      const path = aStarPathfinding(grid, { x: user.location.x, y: user.location.y }, { x: targetX, y: targetY });

      // Check if a valid path was found
      if (path.length === 0) {
        await interaction.editReply('No valid path found to the destination. Try choosing a different target.');
        return;
      }

      // Calculate time based on path length (e.g., 1 minute per tile)
      const travelTime = path.length * 60 * 1000; // Convert minutes to milliseconds

      // Notify the user that movement has started
      await interaction.editReply(`Moving to (${targetX}, ${targetY}). This will take approximately ${path.length} minutes. Please check back later!`);

      // Simulate movement
      setTimeout(async () => {
        try {
          // Update user's location to the target
          user.location.x = targetX;
          user.location.y = targetY;

          console.log(`User moved to new location: x = ${targetX}, y = ${targetY}`);

          // Update user in the database
          await updateUser(userId, user);

          // Notify the user once the movement is complete
          await interaction.followUp(`You have arrived at your destination: (${targetX}, ${targetY}). Use /map to view your location.`);
        } catch (error) {
          console.error(`Error updating user or sending follow-up: ${error.message}`);
        }
      }, travelTime);

    } catch (error) {
      console.error(`Error during pathfinding: ${error.message}`);
      await interaction.editReply('An error occurred while processing your movement. Please try again.');
    }
  }
};
