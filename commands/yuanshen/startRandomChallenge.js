// startRandomDungeon.js
// Command for getting random dungeon in Yuan Shen
// ================

// import
const controller = require('../../service/yuanshen/yuanshenController');

const { Command } = require('discord-akairo');

class yuanshenRandomChallengeCommand extends Command {
    constructor () {
        super('yuanshenchallenge', {
            aliases: ['gchallenge', 'gchal', 'gch']
        });
    }

    exec (message) {
        controller.sendRandomChallenge(message);
    }
}

module.exports = yuanshenRandomChallengeCommand;
