// deploy-commands.js
// Register slash commands with Discord
// Run this once to deploy all slash commands
// ================

// Load environment variables from .env file
require('dotenv').config();

const { REST, Routes } = require('discord.js');
const fs = require('fs');
const path = require('path');
const c = require('./envHandler');

const commands = [];

// Load all command files recursively
function loadCommands (dir) {
    const files = fs.readdirSync(dir);

    for (const file of files) {
        const filePath = path.join(dir, file);
        const stat = fs.statSync(filePath);

        if (stat.isDirectory()) {
            loadCommands(filePath);
        } else if (file.endsWith('.js')) {
            const command = require(filePath);
            // Only push commands that have slash command data
            if (command.data) {
                commands.push(command.data.toJSON());
                console.log(`✓ Loaded slash command: ${command.data.name}`);
            }
        }
    }
}

// Load commands
console.log('Loading slash commands...');
loadCommands(path.join(__dirname, '../commands'));

// Get bot token
const token = c.botToken();
if (!token) {
    console.error('❌ Error: BOT_TOKEN not found');
    console.log('   Set BOT_TOKEN in .env file OR config/settings.json\n');
    process.exit(1);
}

// Get client ID - prefer explicit CLIENT_ID, fallback to extracting from token
let clientId = c.clientId();
if (!clientId) {
    console.log('⚠️  CLIENT_ID not set, extracting from token...');
    clientId = Buffer.from(token.split('.')[0], 'base64').toString();
} else {
    console.log('✓ Using CLIENT_ID from configuration');
}

// Construct and prepare an instance of the REST module
const rest = new REST().setToken(token);

// Deploy commands
(async () => {
    try {
        console.log(`\nStarted refreshing ${commands.length} application (/) commands.`);

        // The put method is used to fully refresh all commands
        const data = await rest.put(
            Routes.applicationCommands(clientId),
            { body: commands }
        );

        console.log(`\n✅ Successfully reloaded ${data.length} application (/) commands.`);
        console.log('\nDeployed commands:');
        data.forEach(cmd => {
            console.log(`  /${cmd.name} - ${cmd.description}`);
        });

        console.log('\n🎉 Slash commands are now available in Discord!');
        console.log('You can use them by typing / in any channel where the bot has access.\n');
    } catch (error) {
        console.error('❌ Error deploying commands:', error);
    }
})();
