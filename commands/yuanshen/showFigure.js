// showFigure.js
// Command for getting details about a figure in Yuan Shen
// ================

// import
const controller = require('../../service/yuanshen/yuanshenController');

const { Command } = require('discord-akairo');

class yuanshenFigureCommand extends Command {
    constructor () {
        super('yuanshenfigure', {
            aliases: ['gfig', 'gfigure', 'gifigure']
        });
    }

    exec (message) {
        controller.sendFigure(message);
    }
}

module.exports = yuanshenFigureCommand;
