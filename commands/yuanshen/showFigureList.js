// showFigureList.js
// Command for getting a list with all figures in Yuan Shen
// ================

// import
const controller = require('../../service/yuanshen/yuanshenController');

const { Command } = require('discord-akairo');

class yuanshenFigureListCommand extends Command {
    constructor () {
        super('yuanshenlist', {
            aliases: ['glist', 'genshinlist']
        });
    }

    exec (message) {
        controller.sendFigurelist(message);
    }
}

module.exports = yuanshenFigureListCommand;
