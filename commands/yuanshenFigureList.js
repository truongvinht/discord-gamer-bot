// yuanshenFigure.js
// Command for getting details about a figure in Yuan Shen
// ================

// import
const controller = require('../service/yuanshen/yuanshenController');

const { Command } = require('discord-akairo');

class yuanshenFigureListCommand extends Command {
    constructor () {
        super('impactlist', {
            aliases: ['glist', 'imlist', 'genshinlist']
        });
    }

    exec (message) {
        controller.sendFigurelist(message);
    }
}

module.exports = yuanshenFigureListCommand;
