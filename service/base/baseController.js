// baseController.js
// Controller to prepare base content for discord response
// ================

const Discord = require("discord.js");
const c = require("../../helper/envHandler");

const help = (message) => {

    let author = message.author.username;
    let PREFIX = c.prefix();

    let embed = new Discord.MessageEmbed()
    .setTitle(`General Commands`)
    .setAuthor(`${author}`)
    .setDescription(`Following commands are available:`)
    .addField(`${PREFIX}achelp`, `Auto Chess Help`)
    .addField(`${PREFIX}pmHelp`, `Pokemon Masters Help`);
    
    embed.setFooter(`Version: ${c.version()} - ${c.author()}`);

    message.channel.send(embed);
}

//export
module.exports = {
    getHelpMessage: help,
};