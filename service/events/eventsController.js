// eventsController.js
// Discord Scheduled Events Controller
// ==================

const { EmbedBuilder } = require('discord.js');
const service = require('./eventsService');
const c = require('../../helper/envHandler');

/**
 * Create success embed with event details
 * @param {Object} result - Service result object
 * @returns {EmbedBuilder} Discord embed
 */
function createSuccessEmbed (result) {
    const embed = new EmbedBuilder()
        .setTitle('✅ Event Created Successfully')
        .setDescription(result.eventName)
        .addFields(
            { name: '📅 Date', value: result.dateFormatted, inline: true },
            { name: '🕐 Time', value: result.timeFormatted, inline: true },
            { name: '🔊 Channel', value: result.channelName, inline: true },
            { name: '🔗 Event Link', value: result.eventUrl, inline: false }
        )
        .setColor(0x00FF00)
        .setFooter({ text: 'Click the link to view event details' });

    return embed;
}

/**
 * Create error embed with troubleshooting information
 * @param {Object} result - Service result object
 * @returns {EmbedBuilder} Discord embed
 */
function createErrorEmbed (result) {
    const embed = new EmbedBuilder()
        .setTitle('❌ Event Creation Failed')
        .setColor(0xFF0000);

    let description = 'An error occurred while creating the event.';
    let troubleshooting = '';

    switch (result.error) {
        case 'INVALID_TIME_FORMAT':
            description = 'Invalid time configuration.';
            troubleshooting = 'Please check your `config/settings.json` file and ensure event times are in HH:mm format (24-hour).';
            break;
        case 'MISSING_PERMISSIONS':
            description = 'Bot is missing required permissions.';
            troubleshooting = 'Please ensure the bot has the **Manage Events** permission in this server.\n\n' +
                'Server Settings → Roles → Bot Role → Enable "Manage Events"';
            break;
        case 'NO_VOICE_CHANNELS':
            description = 'No voice channels available.';
            troubleshooting = 'Please create at least one voice channel in this server before creating events.';
            break;
        case 'API_ERROR':
            description = 'Discord API error.';
            troubleshooting = 'An unexpected error occurred. Please try again later.';
            break;
        case 'EVENT_TIME_NOT_CONFIGURED':
            description = 'Event time not configured.';
            troubleshooting = 'Please add event time configuration to your `config/settings.json` file.';
            break;
        default:
            troubleshooting = 'Please contact the bot administrator.';
    }

    embed.setDescription(description);

    if (result.message) {
        embed.addFields({ name: 'Error Details', value: result.message, inline: false });
    }

    if (troubleshooting) {
        embed.addFields({ name: 'Troubleshooting', value: troubleshooting, inline: false });
    }

    return embed;
}

/**
 * Format and send event response
 * @param {Message|Interaction} source - Discord message or interaction
 * @param {Object} result - Service result object
 * @returns {Promise} Discord response promise
 */
async function formatEventResponse (source, result) {
    const embed = result.success ? createSuccessEmbed(result) : createErrorEmbed(result);
    const isSlashCommand = !!source.commandName;

    if (isSlashCommand) {
        return source.reply({ embeds: [embed] });
    } else {
        return source.channel.send({ embeds: [embed] });
    }
}

/**
 * Create Friday event handler
 * @param {Message|Interaction} source - Discord message or interaction
 * @param {Client} client - Discord client
 * @returns {Promise} Discord response promise
 */
async function createFridayEvent (source, client) {
    const guild = source.guild;
    if (!guild) {
        const errorResult = {
            success: false,
            error: 'API_ERROR',
            message: 'This command can only be used in a server.'
        };
        return formatEventResponse(source, errorResult);
    }

    const timeStr = c.eventFridayTime();
    if (!timeStr) {
        const errorResult = {
            success: false,
            error: 'EVENT_TIME_NOT_CONFIGURED',
            message: 'Friday event time is not configured in settings.json'
        };
        return formatEventResponse(source, errorResult);
    }

    const result = await service.createEventForDay(guild, 5, timeStr, 'Friday Gaming Session', client);
    return formatEventResponse(source, result);
}

/**
 * Create Sunday event handler
 * @param {Message|Interaction} source - Discord message or interaction
 * @param {Client} client - Discord client
 * @returns {Promise} Discord response promise
 */
async function createSundayEvent (source, client) {
    const guild = source.guild;
    if (!guild) {
        const errorResult = {
            success: false,
            error: 'API_ERROR',
            message: 'This command can only be used in a server.'
        };
        return formatEventResponse(source, errorResult);
    }

    const timeStr = c.eventSundayTime();
    if (!timeStr) {
        const errorResult = {
            success: false,
            error: 'EVENT_TIME_NOT_CONFIGURED',
            message: 'Sunday event time is not configured in settings.json'
        };
        return formatEventResponse(source, errorResult);
    }

    const result = await service.createEventForDay(guild, 0, timeStr, 'Sunday Gaming Session', client);
    return formatEventResponse(source, result);
}

module.exports = {
    createFridayEvent,
    createSundayEvent,
    formatEventResponse,
    createSuccessEmbed,
    createErrorEmbed
};
