// cleanup-commands.js
// Delete slash commands from Discord
// ================
// Usage:
//   npm run cleanup           - Delete ALL slash commands
//   npm run cleanup -- list   - List all registered commands
//   npm run cleanup -- <name> - Delete specific command by name

const { REST, Routes } = require('discord.js');
const c = require('./envHandler');

// Get bot token and extract client ID from it
const token = c.botToken();
if (!token) {
    console.error('❌ Error: BOT_TOKEN not found in settings.json');
    process.exit(1);
}

// Extract client ID from token (first part before first dot)
const clientId = Buffer.from(token.split('.')[0], 'base64').toString();

// Construct REST module
const rest = new REST().setToken(token);

// Get command line argument
const arg = process.argv[2];

(async () => {
    try {
        if (arg === 'list') {
            // List all registered commands
            console.log('📋 Fetching registered slash commands...\n');
            const commands = await rest.get(Routes.applicationCommands(clientId));

            if (commands.length === 0) {
                console.log('✓ No slash commands registered.');
            } else {
                console.log(`Found ${commands.length} registered command(s):\n`);
                commands.forEach(cmd => {
                    console.log(`  /${cmd.name} (ID: ${cmd.id})`);
                    console.log(`    └─ ${cmd.description}\n`);
                });
            }
        } else if (arg) {
            // Delete specific command by name
            console.log(`🔍 Searching for command: ${arg}...\n`);
            const commands = await rest.get(Routes.applicationCommands(clientId));
            const command = commands.find(cmd => cmd.name === arg);

            if (!command) {
                console.error(`❌ Command '${arg}' not found.`);
                console.log('\nRegistered commands:');
                commands.forEach(cmd => console.log(`  /${cmd.name}`));
                process.exit(1);
            }

            await rest.delete(Routes.applicationCommand(clientId, command.id));
            console.log(`✅ Successfully deleted command: /${command.name}`);
        } else {
            // Delete ALL commands
            console.log('⚠️  Warning: This will delete ALL slash commands!\n');
            console.log('Deleting all application (/) commands...\n');

            await rest.put(
                Routes.applicationCommands(clientId),
                { body: [] }
            );

            console.log('✅ Successfully deleted all slash commands.');
            console.log('\n💡 Run "npm run deploy" to re-register commands.\n');
        }
    } catch (error) {
        console.error('❌ Error:', error);
    }
})();
