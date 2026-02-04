// app.js - Discord Bot Client - Native discord.js v14

// Load environment variables from .env file
require('dotenv').config();

const { Client, GatewayIntentBits, Partials, Collection } = require('discord.js');
const fs = require('fs');
const path = require('path');
const c = require('./helper/envHandler');

// Create client with required intents
const client = new Client({
    intents: [
        GatewayIntentBits.Guilds,
        GatewayIntentBits.GuildMessages,
        GatewayIntentBits.MessageContent, // PRIVILEGED - must enable in portal
        GatewayIntentBits.GuildMessageReactions,
        GatewayIntentBits.GuildScheduledEvents
    ],
    partials: [Partials.Message, Partials.Reaction],
    allowedMentions: { parse: [], repliedUser: false }
});

// Bot configuration
client.config = {
    prefix: c.prefix()
};

// Bot state (preserved from original)
client.queue = new Map();
client.dispatcher = null;
client.defaultVolume = 1.0;

// Command collections
client.commands = new Collection();
client.aliases = new Collection();

// Load commands recursively
function loadCommands (dir) {
    const files = fs.readdirSync(dir);

    for (const file of files) {
        const filePath = path.join(dir, file);
        const stat = fs.statSync(filePath);

        if (stat.isDirectory()) {
            loadCommands(filePath);
        } else if (file.endsWith('.js')) {
            try {
                const command = require(filePath);
                if (command.name) {
                    client.commands.set(command.name, command);
                    if (command.aliases) {
                        command.aliases.forEach(alias => {
                            client.aliases.set(alias, command.name);
                        });
                    }
                    console.log(`Loaded command: ${command.name}`);
                }
            } catch (error) {
                console.error(`Error loading command ${file}:`, error);
            }
        }
    }
}

// Load event listeners
function loadEvents (dir) {
    const files = fs.readdirSync(dir);

    for (const file of files) {
        if (file.endsWith('.js')) {
            try {
                const event = require(path.join(dir, file));
                if (event.name && event.execute) {
                    if (event.once) {
                        client.once(event.name, (...args) => event.execute(...args, client));
                    } else {
                        client.on(event.name, (...args) => event.execute(...args, client));
                    }
                    console.log(`Loaded event: ${event.name}`);
                }
            } catch (error) {
                console.error(`Error loading event ${file}:`, error);
            }
        }
    }
}

// Message command handler (prefix commands - legacy support)
client.on('messageCreate', async (message) => {
    if (message.author.bot) return;
    if (!message.content.startsWith(client.config.prefix)) return;

    const args = message.content.slice(client.config.prefix.length).trim().split(/ +/);
    const commandName = args.shift().toLowerCase();

    const command = client.commands.get(commandName) ||
        client.commands.get(client.aliases.get(commandName));

    if (!command) return;

    try {
        await command.execute(message, args, client);
    } catch (error) {
        console.error(`Error executing ${commandName}:`, error);
        message.reply('There was an error executing that command.');
    }
});

// Interaction command handler (slash commands)
client.on('interactionCreate', async (interaction) => {
    if (!interaction.isChatInputCommand()) return;

    const command = client.commands.get(interaction.commandName);

    if (!command) {
        console.error(`No command matching ${interaction.commandName} was found.`);
        return;
    }

    try {
        await command.execute(interaction, [], client);
    } catch (error) {
        console.error(`Error executing ${interaction.commandName}:`, error);
        if (interaction.replied || interaction.deferred) {
            await interaction.followUp({ content: 'There was an error while executing this command!', ephemeral: true });
        } else {
            await interaction.reply({ content: 'There was an error while executing this command!', ephemeral: true });
        }
    }
});

// Load everything
console.log('Loading commands...');
loadCommands(path.join(__dirname, 'commands'));

console.log('Loading events...');
loadEvents(path.join(__dirname, 'listeners'));

// Login
client.login(c.botToken())
    .then(() => console.log('Login Done!'))
    .catch(error => {
        console.error('Failed to login:', error);
        process.exit(1);
    });

module.exports = client;
