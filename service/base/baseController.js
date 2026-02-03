// baseController.js
// Controller to prepare base content for discord response
// ================

const { EmbedBuilder } = require('discord.js');
const c = require('../../helper/envHandler');

const help = (source) => {
    // Universal: works for both Message and Interaction
    const author = source.user?.username || source.author?.username;
    const PREFIX = c.prefix();

    const embed = new EmbedBuilder()
        .setTitle('General Commands')
        .setAuthor({ name: author })
        .setDescription('Following commands are available:')
        .addFields(
            { name: `${PREFIX}ghelp`, value: 'Genshin Impact Help', inline: false },
            { name: `${PREFIX}achelp or /achelp`, value: 'Auto Chess Help', inline: false },
            { name: `${PREFIX}pmHelp or /pmhelp`, value: 'Pokemon Masters Help', inline: false }
        )
        .setFooter({ text: `Version: ${c.version()} - ${c.author()}` });

    // Check if it's an interaction (slash) or message (prefix)
    if (source.reply && !source.channel) {
        // Slash command - use interaction.reply()
        return source.reply({ embeds: [embed] });
    } else {
        // Prefix command - use message.channel.send()
        return source.channel.send({ embeds: [embed] });
    }
};

// export
module.exports = {
    getHelpMessage: help
};
