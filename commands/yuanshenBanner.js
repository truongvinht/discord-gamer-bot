// yuanshenBanner.js
// Command for getting banners in Yuan Shen
// ================

// import
const controller = require('../service/yuanshen/yuanshenController');

const { Command } = require('discord-akairo');

class yuanshenBannerCommand extends Command {
    constructor () {
        super('impactBanner', {
            aliases: ['gbanner', 'imbanner', 'gibanner']
        });
    }

    exec (message) {
        controller.sendBanner(message);
    }
}

module.exports = yuanshenBannerCommand;
