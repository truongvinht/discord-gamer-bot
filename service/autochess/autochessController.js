// autochessController.js
// Controller to prepare content for discord response
// ================

const Discord = require('discord.js');
const service = require('./autochessService');
const AUTOCHESS_TITLE = 'Auto Chess';
const LOGO_URL = 'https://pbs.twimg.com/profile_images/1088372392945045505/3JOuR2pY.jpg';

const help = (PREFIX, author) => {
    const embed = new Discord.MessageEmbed()
        .setTitle(`${AUTOCHESS_TITLE} - Commands`)
        .setAuthor(`${author}`)
        .setDescription('Following commands are available:')
        .addField(`${PREFIX}acrace NAME`, 'Random hero pick [RACE]')
        .addField(`${PREFIX}acclass NAME`, 'Random hero pick [CLASS]')
        .addField(`${PREFIX}acany NAME`, 'Random hero pick [RACE/CLASS]')
        .setThumbnail(LOGO_URL);

    return embed;
};

const raceForMessage = (message) => {
    const msgArguments = message.content.split(' ');

    let playerCounter = msgArguments.length;
    if (playerCounter > 1) {
        // more than one player
        // ignore first
        playerCounter--;
    } else {
        playerCounter++;
    }

    // get synergy
    const synergyList = service.getRandomRace(playerCounter);
    sendSynergyMessages(message, msgArguments, synergyList);
};

const classForMessage = (message) => {
    const msgArguments = message.content.split(' ');

    let playerCounter = msgArguments.length;
    if (playerCounter > 1) {
        // more than one player
        // ignore first
        playerCounter--;
    } else {
        playerCounter++;
    }

    // get synergy
    const synergyList = service.getRandomClass(playerCounter);
    sendSynergyMessages(message, msgArguments, synergyList);
};

const synergyForMessage = (message) => {
    const msgArguments = message.content.split(' ');

    let playerCounter = msgArguments.length;
    if (playerCounter > 1) {
        // more than one player
        // ignore first
        playerCounter--;
    } else {
        playerCounter++;
    }

    // get synergy
    const synergyList = service.getRandomSynergy(playerCounter);
    sendSynergyMessages(message, msgArguments, synergyList);
};

function sendSynergyMessages (message, msgArguments, synergyList) {
    const playerPick = [];

    const userData = message.mentions.users;

    for (let i = 0; i < msgArguments.length - 1; i++) {
        const synergy = synergyList[i];
        let player = msgArguments[i + 1];
        const pick = {};

        const key = player.replace(/[\\<>@#&!]/g, '');
        // eslint-disable-next-line no-useless-escape
        if (player.match(/\<\@.*\>/g)) {
            player = userData.get(key).username;
        }

        pick.player = player;
        pick.synergy = synergy;
        playerPick.push(pick);
    }

    // write a message for every name
    writePlayerSynergy(message, playerPick);
}

function writePlayerSynergy (message, playerPick) {
    if (playerPick.length > 0) {
        const pick = playerPick.shift();

        // player
        const player = pick.player;

        const d = new Discord.MessageEmbed();
        d.setTitle(`${AUTOCHESS_TITLE} - Synergy Pick`);
        d.setDescription('$1, try $2 [$3]'.replace('$1', player).replace('$2', pick.synergy).replace('[$3]', 'synergy'));
        d.setThumbnail(service.getIconUrl(pick.synergy));
        message.channel.send(d).then(async function (message) {
            // write next player
            writePlayerSynergy(message, playerPick);
        });
    }
}

// export
module.exports = {
    getHelpMessage: help,
    getRandomRace: raceForMessage,
    getRandomClass: classForMessage,
    getRandomSynergy: synergyForMessage
};
