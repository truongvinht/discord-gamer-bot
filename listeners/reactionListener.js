// reactionListener.js
// handle reaction
// ================

// import
const { Listener } = require('discord-akairo');
const controller = require('../service/base/reactionHandler');

class ReadyListener extends Listener {
    constructor () {
        super('messageReactionAdd', {
            emitter: 'client',
            event: 'messageReactionAdd'
        });
    }

    exec (reaction, user) {
        controller.messageReaction(reaction, user);
    }
}

module.exports = ReadyListener;
