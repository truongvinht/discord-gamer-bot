// yuanshenyesterday.js
// Command for getting yesterday farming in Yuan Shen
// ================

// import
const controller = require('../service/yuanshen/yuanshenController');

const { Command } = require('discord-akairo');

class yuanshenyesterdayCommand extends Command {
    constructor () {
        super('impactyesterday', {
            aliases: ['gyest', 'gyesterday', 'imyesterday', 'giyesterday', 'ggestern']
        });
    }

    exec (message) {
        controller.sendYesterday(message);
    }
}

module.exports = yuanshenyesterdayCommand;
