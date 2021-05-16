// showBanner.js
// Command for getting current banner in Yuan Shen
// ================

// import
const controller = require('../../service/yuanshen/yuanshenController');

const { Command } = require('discord-akairo');

class yuanshenBannerCommand extends Command {
    constructor () {
        super('genshinbanner', {
            aliases: ['gbanner']
        });
    }

    exec (message) {
        controller.sendBanner(message);
    }
}

module.exports = yuanshenBannerCommand;
