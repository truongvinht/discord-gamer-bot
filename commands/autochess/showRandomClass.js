// showRandomClass.js
// Command for getting random class pick
// ================

// import
const controller = require('../../service/autochess/autochessController');
const { Command } = require('discord-akairo');

class autochessRandomClassCommand extends Command {
    constructor () {
        super('acclass', {
            aliases: ['acclass', 'autochessclass', 'aclass']
        });
    }

    exec (message) {
        return controller.getRandomClass(message);
    }
}

module.exports = autochessRandomClassCommand;
