// play.js
// play stream command
// ================

const { Command } = require('discord-akairo');
const controller = require('../service/media/mediaController');

class PlayCommand extends Command {
    constructor () {
        super('play', {
            aliases: ['play']
        });
    }

    async exec (message) {
        controller.play(message);
    }
}

module.exports = PlayCommand;
