// showFigureTalent.js
// Command for figure talents in Yuan Shen
// ================

// import
const controller = require('../../service/yuanshen/yuanshenController');

const { Command } = require('discord-akairo');

class yuanshenFigureTalentCommand extends Command {
    constructor () {
        super('yuanshentalent', {
            aliases: ['gtal', 'gtalent']
        });
    }

    exec (message) {
        controller.sendFigureTalent(message);
    }
}

module.exports = yuanshenFigureTalentCommand;
