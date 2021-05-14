// showRandomAny.js
// Command for getting random race/class pick
// ================

// import
const controller = require('../../service/autochess/autochessController');
const { Command } = require('discord-akairo');

class autochessRandomClassCommand extends Command {
    constructor () {
        super('acany', {
            aliases: ['acany', 'autochessany', 'aany']
        });
    }

    exec (message) {
        return controller.getRandomSynergy(message);
    }
}

module.exports = autochessRandomClassCommand;
