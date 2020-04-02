// pmastersSyncEvents.js
// Command for getting current sync events
// ================

// import
const controller = require('../service/pmasters/pmastersController');
const { Command } = require('discord-akairo');

class pmastersSyncEventsCommand extends Command {
    constructor () {
        super('pmsyncevent', {
            aliases: ['pmsyncevent', 'pmevent']
        });
    }

    exec (message) {
        return controller.getSyncEvents(message);
    }
}

module.exports = pmastersSyncEventsCommand;
