// pmastersHelp.js
// Help Command for Pokemon Masters
// ================

// import
const { SlashCommandBuilder } = require('discord.js');
const controller = require('../../service/pmasters/pmastersController');
const c = require('../../helper/envHandler');

module.exports = {
    // Prefix command config (legacy)
    name: 'pmhelp',
    aliases: ['pmHelp', 'pokemonmastershelp', 'pmasterhelp'],
    description: 'Display Pokemon Masters commands',

    // Slash command config
    data: new SlashCommandBuilder()
        .setName('pmhelp')
        .setDescription('Display Pokemon Masters commands'),

    // Universal execute function
    execute: async (source, args, client) => {
        const username = source.user?.username || source.author?.username;
        const embed = controller.getHelpMessage(c.prefix(), username);

        // Check if it's an interaction (slash) or message (prefix)
        // Interactions have commandName property, messages don't
        if (source.commandName) {
            // Slash command
            return source.reply({ embeds: [embed] });
        } else {
            // Prefix command
            return source.channel.send({ embeds: [embed] });
        }
    }
};
