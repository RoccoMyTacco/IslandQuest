const mongoose = require('mongoose');

const resourceSchema = new mongoose.Schema({
  type: { type: String, required: true, unique: true },
  name: { type: String, required: true },
  rarity: { type: String, required: true },
  baseGatherRate: { type: Number, required: true },
  replenishRate: { type: Number, required: true },
  compatibleTerrains: [String], // Terrains where this resource can be gathered
});

module.exports = mongoose.model('Resource', resourceSchema);
