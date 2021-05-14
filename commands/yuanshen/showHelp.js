// showHelp.js
// Command for getting list of all available commands in Yuan Shen.
// ================

// import
const controller = require('../../service/yuanshen/yuanshenController');
const c = require('../../helper/envHandler');

const { Command } = require('discord-akairo');

class yuanshenHelpCommand extends Command {
    constructor () {
        super('yuanshenhelp', {
            aliases: ['gihelp', 'ghelp', 'ghilfe']
        });
    }

    exec (message) {
        return message.channel.send(controller.getHelpMessage(c.prefix(), message.author.username));
    }
}

module.exports = yuanshenHelpCommand;
