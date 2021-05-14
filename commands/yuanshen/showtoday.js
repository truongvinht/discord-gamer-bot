// showtoday.js
// Command for getting today farming in Yuan Shen
// ================

// import
const controller = require('../../service/yuanshen/yuanshenController');

const { Command } = require('discord-akairo');

class yuanshentodayCommand extends Command {
    constructor () {
        super('yuanshentoday', {
            aliases: ['gtoday', 'gheute']
        });
    }

    exec (message) {
        controller.sendToday(message);
    }
}

module.exports = yuanshentodayCommand;
