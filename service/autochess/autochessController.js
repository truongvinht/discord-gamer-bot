// autochessController.js
// Controller to prepare content for discord response
// ================

const { EmbedBuilder } = require('discord.js');
const service = require('./autochessService');
const AUTOCHESS_TITLE = 'Auto Chess';
const LOGO_URL = 'https://pbs.twimg.com/profile_images/1088372392945045505/3JOuR2pY.jpg';

const help = (PREFIX, author) => {
    const embed = new EmbedBuilder()
        .setTitle(`${AUTOCHESS_TITLE} - Commands`)
        .setAuthor({ name: author })
        .setDescription('Following commands are available:')
        .addFields(
            { name: `${PREFIX}acrace NAME or /acrace`, value: 'Random hero pick [RACE]', inline: false },
            { name: `${PREFIX}acclass NAME or /acclass`, value: 'Random hero pick [CLASS]', inline: false },
            { name: `${PREFIX}acany NAME or /acany`, value: 'Random hero pick [RACE/CLASS]', inline: false }
        )
        .setThumbnail(LOGO_URL);

    return embed;
};

// Helper to get player names from either message or interaction
function getPlayerNames (source) {
    // Check if it's a slash command (interaction)
    if (source.options) {
        const playersOption = source.options.getString('players');
        if (playersOption) {
            return playersOption.split(/\s+/);
        }
        return [source.user.username];
    }

    // Prefix command (message)
    const msgArguments = source.content.split(' ');
    if (msgArguments.length > 1) {
        return msgArguments.slice(1);
    }
    return [source.author.username];
}

const raceForMessage = (source) => {
    const players = getPlayerNames(source);
    const playerCounter = players.length || 1;

    // get synergy
    const synergyList = service.getRandomRace(playerCounter);
    sendSynergyMessages(source, players, synergyList);
};

const classForMessage = (source) => {
    const players = getPlayerNames(source);
    const playerCounter = players.length || 1;

    // get synergy
    const synergyList = service.getRandomClass(playerCounter);
    sendSynergyMessages(source, players, synergyList);
};

const synergyForMessage = (source) => {
    const players = getPlayerNames(source);
    const playerCounter = players.length || 1;

    // get synergy
    const synergyList = service.getRandomSynergy(playerCounter);
    sendSynergyMessages(source, players, synergyList);
};

function sendSynergyMessages (source, players, synergyList) {
    const playerPick = [];

    // Get mentions if it's a message
    const userData = source.mentions?.users;

    for (let i = 0; i < players.length; i++) {
        const synergy = synergyList[i];
        let player = players[i];
        const pick = {};

        // Handle Discord mentions for prefix commands
        if (userData) {
            const key = player.replace(/[\\<>@#&!]/g, '');
            // eslint-disable-next-line no-useless-escape
            if (player.match(/\<\@.*\>/g)) {
                const user = userData.get(key);
                if (user) {
                    player = user.username;
                }
            }
        }

        pick.player = player;
        pick.synergy = synergy;
        playerPick.push(pick);
    }

    // write a message for every name
    writePlayerSynergy(source, playerPick);
}

function writePlayerSynergy (source, playerPick) {
    if (playerPick.length > 0) {
        const pick = playerPick.shift();

        // player
        const player = pick.player;

        const d = new EmbedBuilder();
        d.setTitle(`${AUTOCHESS_TITLE} - Synergy Pick`);
        d.setDescription('$1, try $2 [$3]'.replace('$1', player).replace('$2', pick.synergy).replace('[$3]', 'synergy'));
        d.setThumbnail(service.getIconUrl(pick.synergy));

        // Send response based on type
        if (source.reply && !source.channel) {
            // Slash command - use followUp after first reply
            if (playerPick.length === 0) {
                source.reply({ embeds: [d] });
            } else {
                source.followUp({ embeds: [d] }).then(async function () {
                    writePlayerSynergy(source, playerPick);
                });
            }
        } else {
            // Prefix command
            source.channel.send({ embeds: [d] }).then(async function (message) {
                writePlayerSynergy(message, playerPick);
            });
        }
    }
}

// export
module.exports = {
    getHelpMessage: help,
    getRandomRace: raceForMessage,
    getRandomClass: classForMessage,
    getRandomSynergy: synergyForMessage
};
