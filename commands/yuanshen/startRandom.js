// startRandom.js
// Command for getting random element in Yuan Shen
// ================

// import
const controller = require('../../service/yuanshen/yuanshenController');

const { Command } = require('discord-akairo');

class yuanshenRandomCommand extends Command {
    constructor () {
        super('yuanshenrandom', {
            aliases: ['gr', 'grand', 'grandom']
        });
    }

    exec (message) {
        controller.sendRandom(message);
    }
}

module.exports = yuanshenRandomCommand;
