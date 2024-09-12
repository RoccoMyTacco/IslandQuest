const NodeCache = require('node-cache');
const cache = new NodeCache({ stdTTL: 300, checkperiod: 60 }); // Example: 5-minute TTL

// Set to store pending updates for deferred writes
const pendingUpdates = new Map();

// Get data from the cache
function getCache(key) {
  return cache.get(key);
}

// Set data to the cache and mark for deferred write
function setCache(key, value) {
  if (typeof key !== 'string' && typeof key !== 'number') {
    throw new Error(`The key argument has to be of type 'string' or 'number'. Found: '${typeof key}'`);
  }
  cache.set(key, value);
}

// Delete data from the cache and pending updates
function delCache(key) {
  cache.del(key);
  pendingUpdates.delete(key);
}

// Get all pending updates for deferred writes
function getPendingUpdates() {
  return pendingUpdates;
}

// Clear all pending updates after writing to the database
function clearPendingUpdates() {
  pendingUpdates.clear();
}

module.exports = {
  getCache,
  setCache,
  delCache,
  getPendingUpdates,
  clearPendingUpdates
};
