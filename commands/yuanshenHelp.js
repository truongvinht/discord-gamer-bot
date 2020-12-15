// yuanshenHelp.js
// Command for getting current loot day Command for Pokemon Masters
// ================

// import
const controller = require('../service/yuanshen/yuanshenController');
const c = require('../helper/envHandler');

const { Command } = require('discord-akairo');

class yuanshenHelpCommand extends Command {
    constructor () {
        super('impactHelp', {
            aliases: ['gihelp', 'imhelp', 'genshinimpacthelp', 'genshinhelp']
        });
    }

    exec (message) {
        return message.channel.send(controller.getHelpMessage(c.prefix(), message.author.username));
    }
}

module.exports = yuanshenHelpCommand;
