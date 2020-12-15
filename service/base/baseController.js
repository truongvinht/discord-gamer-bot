// baseController.js
// Controller to prepare base content for discord response
// ================

const Discord = require('discord.js');
const c = require('../../helper/envHandler');

const help = (message) => {
    const author = message.author.username;
    const PREFIX = c.prefix();

    const embed = new Discord.MessageEmbed()
        .setTitle('General Commands')
        .setAuthor(`${author}`)
        .setDescription('Following commands are available:')
        .addField(`${PREFIX}ghelp`, 'Genshin Impact Help')
        .addField(`${PREFIX}achelp`, 'Auto Chess Help')
        .addField(`${PREFIX}pmHelp`, 'Pokemon Masters Help');

    embed.setFooter(`Version: ${c.version()} - ${c.author()}`);

    message.channel.send(embed);
};

// export
module.exports = {
    getHelpMessage: help
};
