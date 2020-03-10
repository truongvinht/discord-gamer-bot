// readyListener.js
// show log after bot launched
// ================

//import
const { Listener } = require('discord-akairo');

class ReadyListener extends Listener {
    constructor() {
        super('ready', {
            emitter: 'client',
            event: 'ready'
        });
    }

    exec() {
        console.log('Started up!');
    }
}

module.exports = ReadyListener;