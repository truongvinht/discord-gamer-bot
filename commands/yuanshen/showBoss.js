// showBoss.js
// Command for getting details about boss drops for figures in Yuan Shen
// ================

// import
const controller = require('../../service/yuanshen/yuanshenController');

const { Command } = require('discord-akairo');

class yuanshenBossCommand extends Command {
    constructor () {
        super('genshinboss', {
            aliases: ['gboss']
        });
    }

    exec (message) {
        controller.sendBoss(message);
    }
}

module.exports = yuanshenBossCommand;
