// eventSunday.js
// Create scheduled event for next Sunday
// ==================

const { SlashCommandBuilder } = require('discord.js');
const controller = require('../../service/events/eventsController');

module.exports = {
    // Prefix command configuration
    name: 'eventsunday',
    aliases: ['eventsunday', 'sundayevent'],
    description: 'Create scheduled event for next Sunday',

    // Slash command configuration
    data: new SlashCommandBuilder()
        .setName('eventsunday')
        .setDescription('Create scheduled event for next Sunday'),

    // Universal execute function (handles both Message and Interaction)
    execute: async (source, args, client) => {
        return controller.createSundayEvent(source, client);
    }
};
