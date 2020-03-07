const { Command } = require('discord-akairo');

class HelloCommand extends Command {
    constructor() {
        super('hello', {
           aliases: ['hello'] 
        });
    }

    exec(message) {
        return message.channel.send('Hello!');
    }
}

module.exports = HelloCommand;