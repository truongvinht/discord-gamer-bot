// yuanshenFigureTalents.js
// Command for figure talents in Yuan Shen
// ================

// import
const controller = require('../service/yuanshen/yuanshenController');

const { Command } = require('discord-akairo');

class yuanshenFigureTalentCommand extends Command {
    constructor () {
        super('impactfiguretalent', {
            aliases: ['gtal', 'gtalent', 'imtalent', 'imta']
        });
    }

    exec (message) {
        controller.sendFigureTalent(message);
    }
}

module.exports = yuanshenFigureTalentCommand;
