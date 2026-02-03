// pmastersSyncEvents.js
// Command for getting current sync events
// ================

// import
const { SlashCommandBuilder } = require('discord.js');
const controller = require('../../service/pmasters/pmastersController');

module.exports = {
    // Prefix command config (legacy)
    name: 'pmsyncevent',
    aliases: ['pmsyncevent', 'pmevent'],
    description: 'Get Pokemon Masters sync events',

    // Slash command config
    data: new SlashCommandBuilder()
        .setName('pmevent')
        .setDescription('Get Pokemon Masters current sync pair events'),

    // Universal execute function
    execute: async (source, args, client) => {
        return controller.getSyncEvents(source);
    }
};
