// envHandler.js
// Configuration loader - reads from environment variables only
// Environment variables are loaded from .env file by dotenv (see app.js)
// ==================

// Load package.json for version and author metadata
const packageJson = require('../package.json');

// Validate required environment variables
if (!process.env.BOT_TOKEN) {
    console.error('❌ Error: BOT_TOKEN environment variable is required');
    console.log('');
    console.log('📝 Setup instructions:');
    console.log('  1. Copy .env.example to .env');
    console.log('  2. Edit .env and add your Discord bot token');
    console.log('  3. Run: npm start');
    console.log('');
    console.log('💡 Get your bot token from:');
    console.log('   https://discord.com/developers/applications');
    console.log('');
    console.log('📖 See DEPLOYMENT.md for detailed configuration guide');
    console.log('');
    process.exit(1);
}

console.log('✓ Configuration loaded from environment variables');

// Export configuration accessors
module.exports = {
    // Bot credentials
    botToken: () => process.env.BOT_TOKEN,
    clientId: () => process.env.CLIENT_ID,
    guildId: () => process.env.GUILD_ID,

    // Command prefix (default: '!')
    prefix: () => process.env.PREFIX || '!',

    // Bot metadata from package.json
    author: () => packageJson.author || 'Unknown',
    version: () => packageJson.version,

    // Event configuration with defaults
    eventFridayTime: () => process.env.EVENT_FRIDAY_TIME || '19:00',
    eventSundayTime: () => process.env.EVENT_SUNDAY_TIME || '15:00',
    eventDuration: () => parseInt(process.env.EVENT_DURATION) || 2
};
