// yuanshenRandomDungeon.js
// Command for getting random dungeon in Yuan Shen
// ================

// import
const controller = require('../service/yuanshen/yuanshenController');

const { Command } = require('discord-akairo');

class yuanshenRandomDungeonCommand extends Command {
    constructor () {
        super('impactDungeon', {
            aliases: ['gdun', 'gdung', 'gdungeon', 'imdungeon', 'gidungeon']
        });
    }

    exec (message) {
        controller.sendRandomDungeon(message);
    }
}

module.exports = yuanshenRandomDungeonCommand;
