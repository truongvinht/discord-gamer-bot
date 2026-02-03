// showRandomClass.js
// Command for getting random class pick
// ================

// import
const { SlashCommandBuilder } = require('discord.js');
const controller = require('../../service/autochess/autochessController');

module.exports = {
    // Prefix command config (legacy)
    name: 'acclass',
    aliases: ['acclass', 'autochessclass', 'aclass'],
    description: 'Get random Auto Chess class for players',

    // Slash command config
    data: new SlashCommandBuilder()
        .setName('acclass')
        .setDescription('Get random Auto Chess class for players')
        .addStringOption(option =>
            option.setName('players')
                .setDescription('Player names (space-separated)')
                .setRequired(false)),

    // Universal execute function
    execute: async (source, args, client) => {
        return controller.getRandomClass(source);
    }
};
