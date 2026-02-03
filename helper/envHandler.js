// envHandler.js
// Configuration loader for bot settings
// ==================

const path = require('path');

// Load package.json for version and author
const packageJson = require('../package.json');

// Try to load settings.json, fallback to example_settings.json
let settings = {};
const settingsPath = path.join(__dirname, '../config/settings.json');
const examplePath = path.join(__dirname, '../template/example_settings.json');

try {
    settings = require(settingsPath);
} catch (e) {
    if (e.code === 'MODULE_NOT_FOUND') {
        console.log('⚠️  config/settings.json not found. Using template/example_settings.json');
        console.log('    Copy template/example_settings.json to config/settings.json and add your bot token.\n');
        settings = require(examplePath);
    } else {
        throw e;
    }
}

// Validate required settings
if (!settings.token) {
    console.error('❌ Error: Bot token is required in config/settings.json');
    console.log('   Copy template/example_settings.json to config/settings.json and add your token.\n');
    process.exit(1);
}

// Export configuration accessors
module.exports = {
    // Bot credentials
    botToken: () => settings.token,

    // Command prefix (default: '!')
    prefix: () => settings.prefix || '!',

    // Bot metadata from package.json
    author: () => packageJson.author || 'Unknown',
    version: () => packageJson.version
};
