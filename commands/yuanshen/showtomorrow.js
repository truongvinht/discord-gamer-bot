// showtomorrow.js
// Command for getting tomorrow farming in Yuan Shen
// ================

// import
const controller = require('../../service/yuanshen/yuanshenController');

const { Command } = require('discord-akairo');

class yuanshentomorrowCommand extends Command {
    constructor () {
        super('yuanshentomorrow', {
            aliases: ['gtom', 'gtomorrow', 'gmorgen']
        });
    }

    exec (message) {
        controller.sendTomorrow(message);
    }
}

module.exports = yuanshentomorrowCommand;
