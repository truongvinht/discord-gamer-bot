// envHandler.js
// handle environment variable
// ==================

let botSettings = {};
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
let botToken = botSettings.token;
if (botToken === '') {
    // Heroku ENV token
    botToken = process.env.BOT_TOKEN;
}

// Yuan Shen DB Server Token
let yuanshenToken = botSettings.yuanshen_api_token;
if (yuanshenToken === '') {
    // Heroku ENV token
    yuanshenToken = process.env.YUANSHEN_API_TOKEN;
}

// Yuan Shen DB Server Address
let yuanshenServer = botSettings.yuanshen_api_server;
if (yuanshenServer === '') {
    yuanshenServer = process.env.YUANSHEN_API_SERVER;
}

let yuanshenServer2 = botSettings.yuanshen_api2_server;
if (yuanshenServer2 === '') {
    yuanshenServer2 = process.env.YUANSHEN_API2_SERVER;
}

// Yuan Shen DB Server port
let yuanshenServerPort = botSettings.yuanshen_api_port;
if (yuanshenServerPort === '') {
    yuanshenServerPort = process.env.YUANSHEN_API_SERVER_PORT;
}

// Yuan Shen DB Server port
let yuanshenServerSSL = botSettings.yuanshen_api_ssl;
if (yuanshenServerSSL === '') {
    yuanshenServerSSL = true;
}

// TGTG Access Key
let tgtgAccessToken = botSettings.tgtg_access_token;
if (tgtgAccessToken === '') {
    tgtgAccessToken = process.env.TGTG_ACCESS_TOKEN;
}

// TGTG Refresh Key
let tgtgRefreshToken = botSettings.tgtg_refresh_token;
if (tgtgRefreshToken === '') {
    tgtgRefreshToken = process.env.TGTG_REFRESH_TOKEN;
}

// TGTG Refresh Key
let tgtgUser = botSettings.tgtg_user;
if (tgtgUser === '') {
    tgtgUser = process.env.TGTG_User;
}

// Push Notifier Token
let pushoverUser = botSettings.po_user;
if (pushoverUser === '') {
    pushoverUser = process.env.PO_USER;
}

// Push Notifier Token
let pushoverToken = botSettings.po_token;
if (pushoverToken === '') {
    pushoverToken = process.env.PO_TOKEN;
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
    yuanshenToken,
    yuanshenServer,
    yuanshenServer2,
    yuanshenServerPort,
    tgtgAccessToken,
    tgtgRefreshToken,
    tgtgUser,
    pushoverUser,
    pushoverToken,
    author: author,
    version: getVersion
};
