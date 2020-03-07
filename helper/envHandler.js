// envHandler.js
// handle environment variable
// ==================

var botSettings = {};
const exampleSettings = require("../template/example_settings.json");

try {
    botSettings = require("../config/settings.json");
} catch (e) {
    if (e.code !== 'MODULE_NOT_FOUND') {
        throw e;
    }
    console.log('settings.json not found. Loading default example_settings.json...');
    botSettings = exampleSettings;
}


//Bot Token
var botToken = botSettings.token;
if (botToken == "") {
    // Heroku ENV token
    botToken = process.env.BOT_TOKEN;
}

// default language
var language = botSettings.lang;
if (language == "") {
    if (process.env.LANG != null && process.env.LANG != "") {
        // Heroku ENV token
        language = process.env.LANG;
    } else {
        //default language EN
        language = 'en';
    }
}

const getBotToken = () => {
    return botToken;
}

//load prefix
const getPrefix = () => {
    return botSettings.prefix;
}

// language settings for bot output
const lang = () => {
    return language;
}

// author information
const author = () => {
    return exampleSettings.author;
}

const getVersion = () => {
    return exampleSettings.version;
}

// export
module.exports = {
    botToken: getBotToken,
    prefix: getPrefix,
    language: lang,
    author: author,
    version: getVersion
};