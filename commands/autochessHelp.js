// autochessHelp.js
// Help Command for Autochess
// show available commands for Auto Chess
// ================

// import
const controller = require('../service/autochess/autochessController');
const c = require('../helper/envHandler');

const { Command } = require('discord-akairo');

class autochessHelpCommand extends Command {
    constructor () {
        super('autochessHelp', {
            aliases: ['achelp']
        });
    }

    exec (message) {
        return message.channel.send(controller.getHelpMessage(c.prefix(), message.author.username));
    }
}

module.exports = autochessHelpCommand;
