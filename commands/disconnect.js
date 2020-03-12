// disconnect.js
// disconnect bot from voice channel and delete its play list
// ================

const { Command } = require('discord-akairo');
const controller = require("../service/media/mediaController");

class DisconnectCommand extends Command {
    constructor() {
        super('disconnect', {
           aliases: ['disconnect','leave','discon'] 
        });
    }
    async exec(message) {
        controller.disconnect(message);
    }
}

module.exports = DisconnectCommand;