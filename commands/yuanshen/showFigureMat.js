// showFigureList.js
// Command for getting a list with all figures in Yuan Shen
// ================

// import
const controller = require('../../service/yuanshen/yuanshenController');

const { Command } = require('discord-akairo');

class yuanshenFigureListCommand extends Command {
    constructor () {
        super('yuanshenfigmat', {
            aliases: ['gfm', 'genshinfigmat']
        });
    }

    exec (message) {
        controller.sendFigMat(message);
    }
}

module.exports = yuanshenFigureListCommand;
