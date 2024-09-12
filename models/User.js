// models/User.js
const mongoose = require('mongoose');

const inventoryItemSchema = new mongoose.Schema({
  type: { type: String, required: true },
  amount: { type: Number, default: 0 },
});

const exploringSchema = new mongoose.Schema({
  direction: String,
  startTime: Number,
  endTime: Number,
  duration: Number
});

const userSchema = new mongoose.Schema({
  _id: String, // Composite ID with format `${serverId}_${userId}`
  userId: String, // Discord user ID
  serverId: String, // Discord server ID
  username: String,
  health: Number,
  hunger: Number,
  location: {
    x: Number,
    y: Number,
  },
  inventory: [inventoryItemSchema], // Example inventory format
  equipment: {
    tools: [String],
    weapons: [String],
  },
  status: {
    energy: Number,
    resting: Boolean,
    exploring: exploringSchema,
  },
  structures: [String],
  map: [[String]], // 2D array to store the map as strings representing terrains
  weather: String,
  achievements: [String],
  last_active: Date,
  mapSeed: String,
  mapFilePath: String,
});

userSchema.index({ serverId: 1 }); // Create an index on serverId


module.exports = mongoose.model('User', userSchema);
