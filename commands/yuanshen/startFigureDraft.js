// startFigureDraft.js
// Command for draft figure mode in Yuan Shen
// ================

// import
// const controller = require('../../service/yuanshen/yuanshenController');

const { Command } = require('discord-akairo');

class yuanshenFigureDraftCommand extends Command {
    constructor () {
        super('yuanshenfiguredraft', {
            aliases: ['gdraft', 'gdr']
        });
    }

    exec (message) {
        // controller.sendFigureDraft(message);
    }
}

module.exports = yuanshenFigureDraftCommand;
