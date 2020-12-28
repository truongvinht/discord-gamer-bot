// yuanshenBoss.js
// Command for getting details about boss drops for figures in Yuan Shen
// ================

// import
const controller = require('../service/yuanshen/yuanshenController');

const { Command } = require('discord-akairo');

class yuanshenBossCommand extends Command {
    constructor () {
        super('impactboss', {
            aliases: ['gboss', 'imboss', 'giboss']
        });
    }

    exec (message) {
        controller.sendBoss(message);
    }
}

module.exports = yuanshenBossCommand;
