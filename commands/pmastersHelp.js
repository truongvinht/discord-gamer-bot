// pmastersHelp.js
// Help Command for Pokemon Masters
// ================

//import
//const pmMastersService = require("../service/pmasters/pmastersService");
const autoChessService = require("../service/autochess/autochessService");

const { Command } = require('discord-akairo');

class pmHelpCommand extends Command {
    constructor() {
        super('pmhelp', {
           aliases: ['pmHelp'] 
        });
    }

    exec(message) {
        
        return message.reply(autoChessService.getRandomSynergy(1));
    }
}

module.exports = pmHelpCommand;