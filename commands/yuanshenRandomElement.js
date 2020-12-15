// yuanshenRandomElement.js
// Command for getting random element in Yuan Shen
// ================

// import
const controller = require('../service/yuanshen/yuanshenController');

const { Command } = require('discord-akairo');

class yuanshenRandomElementCommand extends Command {
    constructor () {
        super('impactElement', {
            aliases: ['gelem', 'gelement', 'imelement', 'gielement']
        });
    }

    exec (message) {
        return message.channel.send(controller.getRandomElement(message));
    }
}

module.exports = yuanshenRandomElementCommand;
