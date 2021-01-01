// yuanshenArtifactset.js
// Command for getting details about artifacts in Yuan Shen
// ================

// import
const controller = require('../service/yuanshen/yuanshenController');

const { Command } = require('discord-akairo');

class yuanshenArtifactsetCommand extends Command {
    constructor () {
        super('impactartifactset', {
            aliases: ['gafs', 'gart', 'gartifactset', 'imartifactset', 'giartifactset']
        });
    }

    exec (message) {
        controller.sendArtifact(message);
    }
}

module.exports = yuanshenArtifactsetCommand;
