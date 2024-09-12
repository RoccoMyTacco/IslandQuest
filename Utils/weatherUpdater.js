const { getRandomWeather } = require('./weather');
const User = require('../models/User');
const { updateUser } = require('./mongoLayer');

/**
 * Update the weather for all users in the game.
 */
async function updateWeatherForAllUsers() {
  try {
    // Fetch all users
    const users = await User.find({});

    // Iterate through each user and update the weather
    for (const user of users) {
      const newWeather = getRandomWeather();
      user.weather = newWeather;
      await updateUser(user._id, user);
    }

    console.log('Weather updated for all users.');
  } catch (error) {
    console.error('Error updating weather:', error);
  }
}

// Set an interval to update weather every 10 minutes (600000 milliseconds)
setInterval(updateWeatherForAllUsers, 600000);
