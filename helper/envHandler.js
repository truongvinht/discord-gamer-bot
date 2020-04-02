// envHandler.js
// handle environment variable
// ==================

var botSettings = {};
const exampleSettings = require('../template/example_settings.json');

try {
    botSettings = require('../config/settings.json');
} catch (e) {
    if (e.code !== 'MODULE_NOT_FOUND') {
        throw e;
    }
    console.log('settings.json not found. Loading default example_settings.json...');
    botSettings = exampleSettings;
}

// Bot Token
var botToken = botSettings.token;
if (botToken === '') {
    // Heroku ENV token
    botToken = process.env.BOT_TOKEN;
}

// command prefix
const prefix = process.env.PREFIX || botSettings.prefix;

const getBotToken = () => {
    return botToken;
};

// load prefix
const getPrefix = () => {
    return prefix;
};

// load roles
const getRoles = () => {
    return botSettings.roles;
};

// author information
const author = () => {
    return exampleSettings.author;
};

const getVersion = () => {
    return exampleSettings.version;
};

// export
module.exports = {
    botToken: getBotToken,
    prefix: getPrefix,
    roles: getRoles,
    author: author,
    version: getVersion
};
