const weatherTypes = ['clear', 'rainy', 'stormy', 'foggy'];

/**
 * Get a random weather condition.
 * @returns {string} A random weather condition.
 */
function getRandomWeather() {
  return weatherTypes[Math.floor(Math.random() * weatherTypes.length)];
}

module.exports = {
  weatherTypes,
  getRandomWeather
};
