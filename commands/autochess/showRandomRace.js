// showRandomRace.js
// Command for getting random race pick
// ================

// import
const { SlashCommandBuilder } = require('discord.js');
const controller = require('../../service/autochess/autochessController');

module.exports = {
    // Prefix command config (legacy)
    name: 'acrace',
    aliases: ['acrace', 'autochessrace', 'arace'],
    description: 'Get random Auto Chess race for players',

    // Slash command config
    data: new SlashCommandBuilder()
        .setName('acrace')
        .setDescription('Get random Auto Chess race for players')
        .addStringOption(option =>
            option.setName('players')
                .setDescription('Player names (space-separated)')
                .setRequired(false)),

    // Universal execute function
    execute: async (source, args, client) => {
        return controller.getRandomRace(source);
    }
};
