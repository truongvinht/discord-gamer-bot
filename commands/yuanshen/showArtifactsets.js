// showArtifactsets.js
// Command for getting details about artifacts in Yuan Shen
// ================

// import
const controller = require('../../service/yuanshen/yuanshenController');

const { Command } = require('discord-akairo');

class yuanshenArtifactsetCommand extends Command {
    constructor () {
        super('yuanshenartifactset', {
            aliases: ['gafs', 'gart', 'gartifactset']
        });
    }

    exec (message) {
        controller.sendArtifact(message);
    }
}

module.exports = yuanshenArtifactsetCommand;
