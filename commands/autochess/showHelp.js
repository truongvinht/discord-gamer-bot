// showHelp.js
// Help Command for Autochess
// show available commands for Auto Chess
// ================

// import
const { SlashCommandBuilder } = require('discord.js');
const controller = require('../../service/autochess/autochessController');
const c = require('../../helper/envHandler');

module.exports = {
    // Prefix command config (legacy)
    name: 'autochessHelp',
    aliases: ['achelp', 'ahelp'],
    description: 'Display Auto Chess commands',

    // Slash command config
    data: new SlashCommandBuilder()
        .setName('achelp')
        .setDescription('Display Auto Chess commands'),

    // Universal execute function
    execute: async (source, args, client) => {
        const username = source.user?.username || source.author?.username;
        const embed = controller.getHelpMessage(c.prefix(), username);

        // Check if it's an interaction (slash) or message (prefix)
        // Interactions have commandName property, messages don't
        if (source.commandName) {
            // Slash command - use interaction.reply()
            return source.reply({ embeds: [embed] });
        } else {
            // Prefix command - use message.channel.send()
            return source.channel.send({ embeds: [embed] });
        }
    }
};
