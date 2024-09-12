const mongoose = require('mongoose');
const User = require('../models/User');
const { getCache, setCache, delCache, getPendingUpdates, clearPendingUpdates } = require('./cache');

// Connect to MongoDB
async function connectDB() {
  try {
    await mongoose.connect(process.env.MONGO_URI, { useNewUrlParser: true, useUnifiedTopology: true });
    console.log('Connected to MongoDB');
  } catch (error) {
    console.error('Failed to connect to MongoDB:', error);
    process.exit(1); // Exit process with failure
  }
}

// Find a user by ID
async function findUserById(userId) {
  let user = getCache(userId);
  if (user) {
    return user; // Return user from cache
  }

  // If not in cache, query the database
  try {
    user = await User.findOne({ _id: userId });
    if (user) {
      setCache(userId, user); // Cache the user data
    }
    return user;
  } catch (error) {
    console.error('Error finding user:', error);
    throw error;
  }
}

// Create a new user
// Utils/mongoLayer.js
async function createUser(userId, serverId, username, seed, initialLocation, mapFilePath) {
  try {
    const newUser = new User({
      _id: `${serverId}_${userId}`, // Composite ID
      userId, // Discord user ID
      serverId, // Discord server ID
      username,
      health: 100,
      hunger: 100,
      location: initialLocation,
      inventory: [],
      equipment: {
        tools: [],
        weapons: [],
      },
      status: {
        energy: 100,
        resting: false,
        exploring: null,
      },
      structures: [],
      map: [],
      achievements: [],
      last_active: new Date(),
      mapSeed: seed.toString(),
      mapFilePath,
    });

    await newUser.save();
    setCache(`${serverId}_${userId}`, newUser); // Cache the new user data
    return newUser;
  } catch (error) {
    console.error('Error creating user:', error);
    throw error;
  }
}


async function updateUser(userId, updateData) {
  try {
    let cachedUser = getCache(userId); // Fetch user from cache

    if (cachedUser) {
      // Merge the update data with the cached user data
      const updatedData = { ...cachedUser._doc, ...updateData };
      setCache(userId, updatedData); // Update the cache with merged data
      // Mark this user for deferred write
      getPendingUpdates().set(userId, updatedData);
    } else {
      // If not in cache, fetch from database and update
      const updatedUser = await User.findOneAndUpdate({ _id: userId }, updateData, {
        new: true, // Return the updated document
      });
      if (updatedUser) {
        setCache(userId, updatedUser); // Update the cache with new data
      }
    }
    return getCache(userId); // Return the updated user from cache
  } catch (error) {
    console.error('Error updating user:', error);
    throw error;
  }
}

// Save cached updates to the database
async function saveCachedUpdates() {
  const updates = getPendingUpdates();

  for (const [userId, userData] of updates.entries()) {
    try {
      await User.findOneAndUpdate({ _id: userId }, userData, { new: true });
    } catch (error) {
      console.error(`Error saving cached data for user ${userId}:`, error);
    }
  }

  clearPendingUpdates(); // Clear the cache after saving
  console.log('Cached updates saved to the database.');
}

// Handle graceful shutdown
async function handleShutdown(signal) {
  console.log(`Received ${signal}. Saving cached updates and shutting down...`);
  await saveCachedUpdates(); // Save any remaining cached data to the database
  mongoose.connection.close(() => {
    console.log('MongoDB connection closed.');
    process.exit(0);
  });
}

// Register shutdown handlers for various signals
process.on('SIGINT', handleShutdown); // Ctrl+C
process.on('SIGTERM', handleShutdown); // Termination

// Set an interval to save cached updates every 5 minutes (300000 milliseconds)
setInterval(saveCachedUpdates, 300000);

module.exports = {
  connectDB,
  findUserById,
  createUser,
  updateUser,
  saveCachedUpdates
};
