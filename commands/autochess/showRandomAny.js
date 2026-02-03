// showRandomAny.js
// Command for getting random race/class pick
// ================

// import
const { SlashCommandBuilder } = require('discord.js');
const controller = require('../../service/autochess/autochessController');

module.exports = {
    // Prefix command config (legacy)
    name: 'acany',
    aliases: ['acany', 'autochessany', 'aany'],
    description: 'Get random Auto Chess synergy for players',

    // Slash command config
    data: new SlashCommandBuilder()
        .setName('acany')
        .setDescription('Get random Auto Chess synergy for players')
        .addStringOption(option =>
            option.setName('players')
                .setDescription('Player names (space-separated)')
                .setRequired(false)),

    // Universal execute function
    execute: async (source, args, client) => {
        return controller.getRandomSynergy(source);
    }
};
