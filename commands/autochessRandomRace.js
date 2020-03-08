// autochessRandomRace.js
// Command for getting random race pick
// ================

//import
const controller = require("../service/autochess/autochessController");
const { Command } = require('discord-akairo');

class autochessRandomRaceCommand extends Command {
    constructor() {
        super('acrace', {
           aliases: ['acrace','autochessrace'] 
        });
    }
    exec(message) {
        return controller.getRandomRace(message);
    }
}

module.exports = autochessRandomRaceCommand;