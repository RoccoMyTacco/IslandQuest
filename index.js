require('dotenv').config();
const { Client, GatewayIntentBits, Collection, REST, Routes, Events } = require('discord.js');
const fs = require('fs');
const mongoose = require('mongoose');

// Create a new Discord client
const client = new Client({
  intents: [GatewayIntentBits.Guilds, GatewayIntentBits.GuildMessages]
});

// Set up a collection for commands
client.commands = new Collection();

// Load command files dynamically
const commandFiles = fs.readdirSync('./commands').filter(file => file.endsWith('.js'));

for (const file of commandFiles) {
  const command = require(`./commands/${file}`);
  client.commands.set(command.data.name, command);
}

// Register commands with Discord
const commands = client.commands.map(command => command.data.toJSON());
const rest = new REST({ version: '10' }).setToken(process.env.BOT_TOKEN);

async function registerCommands() {
  const devMode = process.env.DEV_MODE === 'true';

  try {
    console.log('Started refreshing application (/) commands.');

    if (devMode) {
      // Register commands for a specific guild (development mode)
      await rest.put(
        Routes.applicationGuildCommands(process.env.CLIENT_ID, process.env.DEV_GUILD_ID),
        { body: commands }
      );
      console.log('Registered commands in development mode (guild-specific).');
    } else {
      // Register commands globally (production mode)
      await rest.put(
        Routes.applicationCommands(process.env.CLIENT_ID),
        { body: commands }
      );
      console.log('Registered commands globally (production mode).');
    }

  } catch (error) {
    console.error('Error registering commands:', error);
  }
}

// Connect to MongoDB
mongoose.connect(process.env.MONGO_URI, {
  useNewUrlParser: true,
  useUnifiedTopology: true
}).then(() => {
  console.log('Connected to MongoDB');
}).catch(err => {
  console.error('Failed to connect to MongoDB:', err);
});

// Bot ready event
client.once('ready', async () => {
  console.log(`Logged in as ${client.user.tag}!`);

  // Register commands on bot startup
  await registerCommands();
});

// Interaction create event
client.on(Events.InteractionCreate, async interaction => {
  if (!interaction.isCommand()) return;

  const command = client.commands.get(interaction.commandName);

  if (!command) return;

  try {
    await command.execute(interaction);
  } catch (error) {
    console.error(error);
    await interaction.reply({ content: 'There was an error while executing this command!', ephemeral: true });
  }
});

// Log in to Discord
client.login(process.env.BOT_TOKEN);
