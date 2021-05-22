// calculateLevelup.js
// Command for calculate level up in Yuan Shen
// ================

// import
const controller = require('../../service/yuanshen/yuanshenController');

const { Command } = require('discord-akairo');

class yuanshenLevelupCommand extends Command {
    constructor () {
        super('yuanshenlevelup', {
            aliases: ['glevelup', 'glup', 'glv']
        });
    }

    exec (message) {
        controller.sendLevelup(message);
    }
}

module.exports = yuanshenLevelupCommand;
