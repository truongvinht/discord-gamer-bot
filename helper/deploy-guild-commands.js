// deploy-guild-commands.js
// Register slash commands for a specific guild (immediate activation)
// ================

const { REST, Routes } = require('discord.js');
const fs = require('fs');
const path = require('path');
const c = require('./envHandler');

// Get guild ID from command line argument
const guildId = process.argv[2];

if (!guildId) {
    console.error('❌ Error: Guild ID is required');
    console.log('\nUsage: npm run deploy:guild <GUILD_ID>');
    console.log('\nHow to get Guild ID:');
    console.log('1. Enable Developer Mode in Discord (Settings > Advanced > Developer Mode)');
    console.log('2. Right-click your server name');
    console.log('3. Click "Copy Server ID"\n');
    process.exit(1);
}

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

// Get bot token and extract client ID
const token = c.botToken();
if (!token) {
    console.error('❌ Error: BOT_TOKEN not found in settings.json');
    process.exit(1);
}

const clientId = Buffer.from(token.split('.')[0], 'base64').toString();
const rest = new REST().setToken(token);

// Deploy commands
(async () => {
    try {
        console.log(`\nStarted refreshing ${commands.length} guild (/) commands for guild ${guildId}.`);

        // Deploy to specific guild (instant activation)
        const data = await rest.put(
            Routes.applicationGuildCommands(clientId, guildId),
            { body: commands }
        );

        console.log(`\n✅ Successfully reloaded ${data.length} guild (/) commands.`);
        console.log('\nDeployed commands:');
        data.forEach(cmd => {
            console.log(`  /${cmd.name} - ${cmd.description}`);
        });

        console.log('\n🎉 Slash commands are now IMMEDIATELY available in your guild!');
        console.log('You can use them right away by typing / in any channel.\n');
    } catch (error) {
        console.error('❌ Error deploying guild commands:', error);
    }
})();
