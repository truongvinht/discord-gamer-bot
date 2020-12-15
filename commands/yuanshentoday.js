// yuanshentoday.js
// Command for getting today farming in Yuan Shen
// ================

// import
const controller = require('../service/yuanshen/yuanshenController');

const { Command } = require('discord-akairo');

class yuanshentodayCommand extends Command {
    constructor () {
        super('impacttoday', {
            aliases: ['gtoday', 'imtoday', 'gitoday']
        });
    }

    exec (message) {
        return message.channel.send(controller.getToday(message));
    }
}

module.exports = yuanshentodayCommand;
