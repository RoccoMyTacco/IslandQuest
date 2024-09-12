const User = require('../models/User'); // Import your User model
const { createNewMap, regenerateMap } = require('./mapGenerator'); // Import the updated map generator functions
const path = require('path');
const fs = require('fs'); // Import fs module
const { WorldGenerator } = require('gen-biome'); // Import the library
const { getCache, setCache } = require('./cache'); // Import cache utility functions

// Import createUser function
const { createUser, updateUser } = require('./mongoLayer'); // Make sure to import from the correct path

// Helper function to determine the biome based on user's location
function getBiomeAtLocation(location, seed) {
  const generator = new WorldGenerator({
    width: 100,
    height: 100,
    seed, // Use the same seed that was stored in the user profile
  });

  const BIOMES = [
    {
      params: { upperBound: 0.08 },
      data: { name: 'Liquid', color: '#4292c4' },
    },
    {
      params: { lowerBound: 0.08, upperBound: 0.17 },
      data: { name: 'Coast', color: '#c5ac6d' },
    },
    {
      params: { lowerBound: 0.17, upperBound: 0.46 },
      data: { name: 'Fields', color: '#5dbc21' },
    },
    {
      params: { lowerBound: 0.46, upperBound: 0.72 },
      data: { name: 'Mounts', color: '#333333' },
    },
    {
      params: { lowerBound: 0.72 },
      data: { name: 'Mounts', color: '#444444' },
    },
  ];

  for (const { params, data } of BIOMES) {
    generator.addBiome(params, data);
  }

  const world = generator.generate();

  // Get biome data at the specified location
  const biome = world.get({ x: location.x, y: location.y });
  return biome ? biome.name : null; // Return biome name or null if not found
}

async function ensureUserExists(userId, serverId, username) {
  try {
    // Attempt to retrieve the user from the cache first
    const cacheKey = `${serverId}_${userId}`;
    let user = getCache(cacheKey);

    if (user) {
      return user; // Return the user from the cache if found
    }

    // If not found in the cache, attempt to find the user in the database
    user = await User.findOne({ _id: cacheKey });

    if (!user) {
      // If the user doesn't exist, create a new one
      const initialLocation = { x: 0, y: 0 };

      // Create a new map and get the buffer and seed
      const { mapBuffer, seed } = await createNewMap(initialLocation);

      // Save the map image to the file system
      const mapFilePath = path.join(__dirname, '../maps', `${serverId}_${userId}_map.png`);
      fs.writeFileSync(mapFilePath, mapBuffer);

      // Create a new user using the createUser function
      user = await createUser(userId, serverId, username, seed, initialLocation, mapFilePath);
    }

    // Cache the user data after fetching or creating it
    setCache(cacheKey, user);

    return user; // Return the user document
  } catch (error) {
    if (error.code === 11000) {
      // If there's a duplicate key error, fetch the existing user
      console.log('Duplicate user found, fetching existing user.');
      const user = await User.findOne({ _id: `${serverId}_${userId}` });
      // Cache the user data after fetching it
      setCache(cacheKey, user);
      return user;
    } else {
      // Re-throw any other errors
      throw error;
    }
  }
}


// Function to start exploration
async function startExploration(user, direction, hours, totalExplorationTime) {
  const userId = user.userId;
  const serverId = user.serverId;

  // Correctly set the cache key
  const cacheKey = `${userId}-${serverId}`;

  // Set exploration details
  user.status.exploring = {
    direction,
    startTime: Date.now(),
    endTime: Date.now() + totalExplorationTime,
    duration: hours,
  };

  // Update the user cache with the correct key
  setCache(cacheKey, user);

  // Save the updated user object
  await user.save();
}




// Function to generate map based on user's stored seed and show the player location
async function generateMapForUser(userId) {
  let user = getCache(userId); // Check if user data is in cache

  if (!user) {
    user = await User.findOne({ _id: userId }); // If not in cache, query the database
    if (user) {
      setCache(userId, user); // Cache the user data
    } else {
      throw new Error('User not found');
    }
  }

  // Use the stored seed to regenerate the map and include player location
  const mapBuffer = await regenerateMap(user.mapSeed, user.location);
  return mapBuffer;
}

// Function to update the user's location
async function updateUserLocation(userId, newLocation) {
  await User.updateOne({ _id: userId }, { location: newLocation, last_active: new Date() });

  let user = getCache(userId); // Get cached user data
  if (user) {
    user.location = newLocation; // Update location in the cached user data
    user.last_active = new Date(); // Update last active in the cached user data
    setCache(userId, user); // Update the cache with the new data
  }
}

module.exports = { ensureUserExists, updateUserLocation, generateMapForUser, getBiomeAtLocation, startExploration };
