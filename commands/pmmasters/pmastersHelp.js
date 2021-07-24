// pmastersHelp.js
// Help Command for Pokemon Masters
// ================

// import
const controller = require('../../service/pmasters/pmastersController');
const c = require('../../helper/envHandler');

const { Command } = require('discord-akairo');

class pmHelpCommand extends Command {
    constructor () {
        super('pmhelp', {
            aliases: ['pmHelp', 'pokemonmastershelp', 'pmasterhelp']
        });
    }

    exec (message) {
        return message.channel.send(controller.getHelpMessage(c.prefix(), message.author.username));
    }
}

module.exports = pmHelpCommand;
