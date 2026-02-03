// generalHelp.js
// Help Command for all services
// show general available commands
// ================

// import
const { SlashCommandBuilder } = require('discord.js');
const controller = require('../service/base/baseController');

module.exports = {
    // Prefix command config (legacy)
    name: 'help',
    aliases: ['help', 'h', 'hilfe'],
    description: 'Display general bot commands',

    // Slash command config
    data: new SlashCommandBuilder()
        .setName('help')
        .setDescription('Display general bot commands'),

    // Universal execute function (works for both prefix and slash)
    execute: async (source, args, client) => {
        return controller.getHelpMessage(source);
    }
};
