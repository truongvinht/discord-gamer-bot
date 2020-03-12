// queue.js
// show current music queue command
// ================

const { Command } = require('discord-akairo');
const controller = require("../service/media/mediaController");

class QueueCommand extends Command {
    constructor() {
        super('queue', {
           aliases: ['queue'] 
        });
    }
    async exec(message) {
        controller.queue(message);
    }
}

module.exports = QueueCommand;