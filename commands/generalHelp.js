// generalHelp.js
// Help Command for all services
// show general available commands
// ================

// import
const controller = require('../service/base/baseController');
const { Command } = require('discord-akairo');

class generalHelpCommand extends Command {
    constructor () {
        super('help', {
            aliases: ['?', 'h', 'hilfe']
        });
    }

    exec (message) {
        return controller.getHelpMessage(message);
    }
}

module.exports = generalHelpCommand;
