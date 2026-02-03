// eventsService.js
// Discord Scheduled Events Business Logic
// ==================

const { ChannelType, GuildScheduledEventPrivacyLevel, GuildScheduledEventEntityType, PermissionFlagsBits } = require('discord.js');
const c = require('../../helper/envHandler');

/**
 * Calculate the next occurrence of a specific day of the week
 * @param {number} targetDay - Day of week (0=Sunday, 5=Friday)
 * @param {string} timeStr - Time in HH:mm format (24-hour)
 * @returns {Date} Next occurrence of the target day at specified time
 */
function getNextDayOccurrence (targetDay, timeStr) {
    const now = new Date();
    const [hours, minutes] = timeStr.split(':').map(Number);

    const nextDate = new Date(now);
    nextDate.setHours(hours, minutes, 0, 0);

    const currentDay = now.getDay();
    let daysToAdd = targetDay - currentDay;

    // If target day has passed this week, or it's today but time has passed, move to next week
    if (daysToAdd < 0 || (daysToAdd === 0 && now >= nextDate)) {
        daysToAdd += 7;
    }

    nextDate.setDate(now.getDate() + daysToAdd);
    return nextDate;
}

/**
 * Validate time format (HH:mm)
 * @param {string} timeStr - Time string to validate
 * @returns {Object} { valid: boolean, error?: string }
 */
function validateTimeFormat (timeStr) {
    if (!timeStr) {
        return { valid: false, error: 'Time string is required' };
    }

    const timeRegex = /^([0-1]?[0-9]|2[0-3]):([0-5][0-9])$/;
    if (!timeRegex.test(timeStr)) {
        return { valid: false, error: 'Invalid time format. Use HH:mm (24-hour format)' };
    }

    const [hours, minutes] = timeStr.split(':').map(Number);
    if (hours < 0 || hours > 23 || minutes < 0 || minutes > 59) {
        return { valid: false, error: 'Invalid time values. Hours: 0-23, Minutes: 0-59' };
    }

    return { valid: true };
}

/**
 * Check if bot has required permissions
 * @param {Guild} guild - Discord guild
 * @param {Client} client - Discord client
 * @returns {Object} { hasPermission: boolean, error?: string }
 */
function checkBotPermissions (guild, client) {
    const botMember = guild.members.cache.get(client.user.id);
    if (!botMember) {
        return { hasPermission: false, error: 'Bot member not found in guild' };
    }

    const hasManageEvents = botMember.permissions.has(PermissionFlagsBits.ManageEvents);
    if (!hasManageEvents) {
        return { hasPermission: false, error: 'Bot is missing ManageEvents permission' };
    }

    return { hasPermission: true };
}

/**
 * Get first available voice channel in guild
 * @param {Guild} guild - Discord guild
 * @returns {Object} { channel?: Channel, error?: string }
 */
function getFirstVoiceChannel (guild) {
    const voiceChannel = guild.channels.cache.find(
        channel => channel.type === ChannelType.GuildVoice
    );

    if (!voiceChannel) {
        return { error: 'No voice channels found in this server' };
    }

    return { channel: voiceChannel };
}

/**
 * Create a scheduled event for a specific day
 * @param {Guild} guild - Discord guild
 * @param {number} targetDay - Day of week (0=Sunday, 5=Friday)
 * @param {string} timeStr - Time in HH:mm format
 * @param {string} eventName - Name of the event
 * @param {Client} client - Discord client
 * @returns {Promise<Object>} Result object with success status and event details or error
 */
async function createEventForDay (guild, targetDay, timeStr, eventName, client) {
    try {
        // Validate time format
        const timeValidation = validateTimeFormat(timeStr);
        if (!timeValidation.valid) {
            return { success: false, error: 'INVALID_TIME_FORMAT', message: timeValidation.error };
        }

        // Check bot permissions
        const permissionCheck = checkBotPermissions(guild, client);
        if (!permissionCheck.hasPermission) {
            return { success: false, error: 'MISSING_PERMISSIONS', message: permissionCheck.error };
        }

        // Get first voice channel
        const channelResult = getFirstVoiceChannel(guild);
        if (channelResult.error) {
            return { success: false, error: 'NO_VOICE_CHANNELS', message: channelResult.error };
        }

        // Calculate event start time
        const startTime = getNextDayOccurrence(targetDay, timeStr);
        const duration = c.eventDuration();
        const endTime = new Date(startTime.getTime() + duration * 60 * 60 * 1000);

        // Create scheduled event
        const event = await guild.scheduledEvents.create({
            name: eventName,
            scheduledStartTime: startTime,
            scheduledEndTime: endTime,
            privacyLevel: GuildScheduledEventPrivacyLevel.GuildOnly,
            entityType: GuildScheduledEventEntityType.Voice,
            channel: channelResult.channel.id,
            description: `Scheduled ${eventName} session`
        });

        // Format response data
        const dateFormatted = startTime.toLocaleDateString('de-DE', {
            weekday: 'long',
            year: 'numeric',
            month: 'long',
            day: 'numeric'
        });

        const timeFormatted = startTime.toLocaleTimeString('de-DE', {
            hour: '2-digit',
            minute: '2-digit'
        });

        return {
            success: true,
            eventId: event.id,
            eventName: event.name,
            eventUrl: `https://discord.com/events/${guild.id}/${event.id}`,
            channelName: channelResult.channel.name,
            dateFormatted,
            timeFormatted
        };
    } catch (error) {
        return {
            success: false,
            error: 'API_ERROR',
            message: error.message
        };
    }
}

module.exports = {
    createEventForDay,
    getNextDayOccurrence,
    validateTimeFormat,
    checkBotPermissions,
    getFirstVoiceChannel
};
