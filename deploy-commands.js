// deploy-commands.js
// Register slash commands with Discord
// Run this once to deploy all slash commands
// ================

const { REST, Routes } = require('discord.js');
const fs = require('fs');
const path = require('path');
const c = require('./helper/envHandler');

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
loadCommands(path.join(__dirname, 'commands'));

// Get bot token and extract client ID from it
const token = c.botToken();
if (!token) {
    console.error('❌ Error: BOT_TOKEN not found in settings.json');
    process.exit(1);
}

// Extract client ID from token (first part before first dot)
const clientId = Buffer.from(token.split('.')[0], 'base64').toString();

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
