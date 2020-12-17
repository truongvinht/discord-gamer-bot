// yuanshenRandomWeapon.js
// Command for getting random weapon user in Yuan Shen
// ================

// import
const controller = require('../service/yuanshen/yuanshenController');

const { Command } = require('discord-akairo');

class yuanshenRandomWeaponCommand extends Command {
    constructor () {
        super('impactWeapon', {
            aliases: ['gweap', 'gweapon', 'imweapon', 'giweapon']
        });
    }

    exec (message) {
        controller.sendRandomWeapon(message);
    }
}

module.exports = yuanshenRandomWeaponCommand;
