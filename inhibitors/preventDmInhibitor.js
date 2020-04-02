// preventDmInhibotor.js
// Prevent direct message bot for spamming
// ================

// import
const { Inhibitor } = require('discord-akairo');

class PreventDmInhibitor extends Inhibitor {
    constructor () {
        super('restrictDirectMessage', {
            reason: 'restrictDirectMessage'
        });
    }

    exec (message) {
        return false;
        // if (message.channel.type === "dm") {
        //     return true;
        // } else {
        //     return false;
        // }
    }
}

module.exports = PreventDmInhibitor;
