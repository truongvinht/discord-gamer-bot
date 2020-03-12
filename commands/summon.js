// summon.js
// summon bot to voice channel
// ================

const { Command } = require('discord-akairo');
const controller = require("../service/media/mediaController");

class SummonCommand extends Command {
    constructor() {
        super('summon', {
           aliases: ['summon'] 
        });
    }
    async exec(message) {
        controller.summon(message);
    }
}

module.exports = SummonCommand;