// skip.js
// skip current song in voice channel
// ================

const { Command } = require('discord-akairo');
const controller = require("../service/media/mediaController");

class SkipCommand extends Command {
    constructor() {
        super('skip', {
           aliases: ['skip'] 
        });
    }
    async exec(message) {
        //controller.skip(message);
        return message.channel.send("Feature: NOT READY");
    }
}

module.exports = SkipCommand;