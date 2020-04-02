// volume.js
// volume for playing command
// ================

const { Command } = require('discord-akairo');
const controller = require('../service/media/mediaController');

class VolumeCommand extends Command {
    constructor () {
        super('volume', {
            aliases: ['volume']
        });
    }

    async exec (message) {
        controller.volume(message);
    }
}

module.exports = VolumeCommand;
