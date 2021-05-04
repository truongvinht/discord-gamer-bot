// yuanshenRandomDungeon.js
// Command for getting random dungeon in Yuan Shen
// ================

// import
const controller = require('../service/yuanshen/yuanshenController');

const { Command } = require('discord-akairo');

class yuanshenRandomLowChallengeCommand extends Command {
    constructor () {
        super('impactlowchallenge', {
            aliases: ['glchallenge', 'glchal', 'glc', 'glch']
        });
    }

    exec (message) {
        controller.sendRandomLowChallenge(message);
    }
}

module.exports = yuanshenRandomLowChallengeCommand;
