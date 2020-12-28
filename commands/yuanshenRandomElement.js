// yuanshenRandomElement.js
// Command for getting random element in Yuan Shen
// ================

// import
const controller = require('../service/yuanshen/yuanshenController');

const { Command } = require('discord-akairo');

class yuanshenRandomElementCommand extends Command {
    constructor () {
        super('impactElement', {
            aliases: ['gel', 'gelem', 'gelement', 'imelement', 'gielement']
        });
    }

    exec (message) {
        controller.sendRandomElement(message);
    }
}

module.exports = yuanshenRandomElementCommand;
