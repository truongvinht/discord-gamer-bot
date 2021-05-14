// startRandomDungeon.js
// Command for getting random dungeon in Yuan Shen
// ================

// import
const controller = require('../../service/yuanshen/yuanshenController');

const { Command } = require('discord-akairo');

class yuanshenRandomDungeonCommand extends Command {
    constructor () {
        super('yuanshenDungeon', {
            aliases: ['gdg', 'gdun', 'gdung', 'gdungeon']
        });
    }

    exec (message) {
        controller.sendRandomDungeon(message);
    }
}

module.exports = yuanshenRandomDungeonCommand;
