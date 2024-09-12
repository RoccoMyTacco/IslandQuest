require('dotenv').config(); // This should be at the very top of the file

const mongoose = require('mongoose');
const Resource = require('../models/Resource');

const resources = [
  {
    type: 'wood',
    name: 'Wood',
    rarity: 'common',
    baseGatherRate: 10,
    replenishRate: 5,
    compatibleTerrains: ['forest', 'plain'],
  },
  {
    type: 'stone',
    name: 'Stone',
    rarity: 'common',
    baseGatherRate: 8,
    replenishRate: 4,
    compatibleTerrains: ['mountain'],
  },
  {
    type: 'food',
    name: 'Food',
    rarity: 'common',
    baseGatherRate: 5,
    replenishRate: 3,
    compatibleTerrains: ['plain', 'forest'],
  },
  {
    type: 'iron',
    name: 'Iron',
    rarity: 'uncommon',
    baseGatherRate: 3,
    replenishRate: 2,
    compatibleTerrains: ['mountain'],
  },
  {
    type: 'gold',
    name: 'Gold',
    rarity: 'rare',
    baseGatherRate: 1,
    replenishRate: 1,
    compatibleTerrains: ['mountain'],
  },
];

// Connect to the database and initialize resources
mongoose.connect(process.env.MONGO_URI, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
});

async function initializeResources() {
  try {
    await Resource.insertMany(resources);
    console.log('Resources initialized successfully.');
    mongoose.connection.close();
  } catch (error) {
    console.error('Error initializing resources:', error);
    mongoose.connection.close();
  }
}

initializeResources();
