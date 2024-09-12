const { createCanvas } = require('canvas');
const { WorldGenerator } = require('gen-biome');

const TILE_SIZE = 50; // Define a tile size for map tiles
const MAP_WIDTH = 100; // Fixed width for the map
const MAP_HEIGHT = 100; // Fixed height for the map

// Biome configurations with specified colors
const BIOMES = [
  { params: { upperBound: 0.08 }, data: { name: 'Liquid', color: '#4292c4' } },
  { params: { lowerBound: 0.08, upperBound: 0.11 }, data: { name: 'Liquid', color: '#4c9ccd' } },
  { params: { lowerBound: 0.11, upperBound: 0.14 }, data: { name: 'Liquid', color: '#51a5d8' } },
  { params: { lowerBound: 0.14, upperBound: 0.17 }, data: { name: 'Liquid', color: '#56aade' } },
  { params: { lowerBound: 0.17, upperBound: 0.22 }, data: { name: 'Coast', color: '#c5ac6d' } },
  { params: { lowerBound: 0.22, upperBound: 0.25 }, data: { name: 'Coast', color: '#ccb475' } },
  { params: { lowerBound: 0.25, upperBound: 0.28 }, data: { name: 'Coast', color: '#d2ba7d' } },
  { params: { lowerBound: 0.28, upperBound: 0.34 }, data: { name: 'Fields', color: '#67c72b' } },
  { params: { lowerBound: 0.34, upperBound: 0.46 }, data: { name: 'Fields', color: '#5dbc21' } },
  { params: { lowerBound: 0.46, upperBound: 0.65 }, data: { name: 'Fields', color: '#56ae1e' } },
  { params: { lowerBound: 0.65, upperBound: 0.72 }, data: { name: 'Mounts', color: '#333333' } },
  { params: { lowerBound: 0.72, upperBound: 0.79 }, data: { name: 'Mounts', color: '#444444' } },
  { params: { lowerBound: 0.79 }, data: { name: 'Mounts', color: '#555555' } },
];

// Function to generate a map based on a seed
function generateMapFromSeed(seed, width, height) {
  const generator = new WorldGenerator({
    width: width,
    height: height,
    seed: seed
  });

  for (const { params, data } of BIOMES) {
    generator.addBiome(params, data);
  }

  // Generate the world using the seed
  const world = generator.generate();

  return world;
}

// Convert the generated world to a grid
function worldToGrid(world) {
  const grid = [];
  world.each((position, biome) => {
    if (!grid[position.x]) {
      grid[position.x] = [];
    }
    // Use the biome name for simplicity, or adjust based on your logic
    grid[position.x][position.y] = biome.name;
  });
  return grid;
}

// Function to create a new map and return the buffer and seed
async function createNewMap(playerLocation) {
  const canvas = createCanvas(MAP_WIDTH * TILE_SIZE, MAP_HEIGHT * TILE_SIZE);
  const ctx = canvas.getContext('2d');

  // Initialize WorldGenerator without specifying a seed
  const generator = new WorldGenerator({
    width: MAP_WIDTH,
    height: MAP_HEIGHT,
  });

  // Add biomes to the generator
  for (const { params, data } of BIOMES) {
    generator.addBiome(params, data);
  }

  // Generate the world map using the generator
  const world = generator.generate();

  // Render each tile based on its biome color
  world.each((position, biome) => {
    const tileX = position.x * TILE_SIZE;
    const tileY = position.y * TILE_SIZE;

    ctx.fillStyle = biome.color;
    ctx.fillRect(tileX, tileY, TILE_SIZE, TILE_SIZE);
  });

  // Draw the player marker
  if (playerLocation) {
    drawPlayerMarker(ctx, playerLocation);
  }

  // Retrieve the generated seed and ensure it is a string
  const seed = String(world.seed); // Convert the seed to a string

  // Return the map as a PNG buffer and the seed
  return { mapBuffer: canvas.toBuffer('image/png'), seed };
}

// Function to regenerate a map using a specific seed
async function regenerateMap(seed, playerLocation) {
  const canvas = createCanvas(MAP_WIDTH * TILE_SIZE, MAP_HEIGHT * TILE_SIZE);
  const ctx = canvas.getContext('2d');

  // Initialize WorldGenerator with specified width, height, and seed
  const generator = new WorldGenerator({
    width: MAP_WIDTH,
    height: MAP_HEIGHT,
    seed: seed, // Use the provided seed to regenerate the map
  });

  // Add biomes to the generator
  for (const { params, data } of BIOMES) {
    generator.addBiome(params, data);
  }

  // Generate the world map using the generator
  const world = generator.generate();

  // Render each tile based on its biome color
  world.each((position, biome) => {
    const tileX = position.x * TILE_SIZE;
    const tileY = position.y * TILE_SIZE;

    ctx.fillStyle = biome.color;
    ctx.fillRect(tileX, tileY, TILE_SIZE, TILE_SIZE);
  });

  // Draw the player marker
  if (playerLocation) {
    drawPlayerMarker(ctx, playerLocation);
  }

  // Return the regenerated map as a PNG buffer
  return canvas.toBuffer('image/png');
}

// Function to draw the player marker on the map
function drawPlayerMarker(ctx, playerLocation) {
  const playerX = playerLocation.x * TILE_SIZE + TILE_SIZE / 2;
  const playerY = playerLocation.y * TILE_SIZE + TILE_SIZE / 2;
  const markerSize = 10; // Size of the player marker

  ctx.fillStyle = 'red'; // Color for the player marker
  ctx.beginPath();
  ctx.arc(playerX, playerY, markerSize, 0, Math.PI * 2); // Draw a circle as the marker
  ctx.fill();
}

module.exports = { createNewMap, regenerateMap, generateMapFromSeed, worldToGrid };
