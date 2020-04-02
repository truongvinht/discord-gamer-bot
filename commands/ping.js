// ping.js
// ping test command
// ================

const { Command } = require('discord-akairo');
const c = require('../helper/envHandler');

class PingCommand extends Command {
    constructor () {
        super('ping', {
            aliases: ['ping']
        });
    }

    userPermissions (message) {
        var permission = null;

        for (const role of c.roles()) {
            permission = role;
            const roles = message.member._roles;

            if (roles.length === 0) {
                return role;
            }

            if (roles.includes(role)) {
                return null;
            }
        }

        return permission;
    }

    exec (message) {
        return message.reply('Pong!');
    }
}

module.exports = PingCommand;
