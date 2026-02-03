// eventFriday.js
// Create scheduled event for next Friday
// ==================

const { SlashCommandBuilder } = require('discord.js');
const controller = require('../../service/events/eventsController');

module.exports = {
    // Prefix command configuration
    name: 'eventfriday',
    aliases: ['eventfriday', 'fridayevent'],
    description: 'Create scheduled event for next Friday',

    // Slash command configuration
    data: new SlashCommandBuilder()
        .setName('eventfriday')
        .setDescription('Create scheduled event for next Friday'),

    // Universal execute function (handles both Message and Interaction)
    execute: async (source, args, client) => {
        return controller.createFridayEvent(source, client);
    }
};
