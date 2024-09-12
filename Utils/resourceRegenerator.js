const User = require('../models/User');
const Resource = require('../models/Resource');
const { updateUser } = require('./mongoLayer');

/**
 * Regenerate resources for all users in the game.
 */
async function regenerateResources() {
  try {
    // Fetch all users
    const users = await User.find({});
    const allResources = await Resource.find({});

    // Iterate through each user and replenish resources
    for (const user of users) {
      let resourcesReplenished = false;

      // Iterate through each resource type in the global resource collection
      for (const resource of allResources) {
        const userResource = user.inventory.find(res => res.type === resource.type);

        if (userResource) {
          const maxInventory = 100; // Example max inventory limit
          const newAmount = userResource.amount + resource.replenishRate;

          // Update the user's inventory if not exceeding max inventory
          if (newAmount <= maxInventory) {
            userResource.amount = newAmount;
            resourcesReplenished = true;
          }
        }
      }

      if (resourcesReplenished) {
        await updateUser(user._id, user);
      }
    }

    console.log('Resources replenished for all users.');
  } catch (error) {
    console.error('Error replenishing resources:', error);
  }
}

// Set an interval to regenerate resources every 15 minutes (900000 milliseconds)
setInterval(regenerateResources, 900000);

module.exports = regenerateResources;
