// autochessController.js
// Controller to prepare content for discord response
// ================

const Discord = require("discord.js");
const service = require("./autochessService");
const AUTOCHESS_TITLE = "Auto Chess"
const LOGO_URL = "https://pbs.twimg.com/profile_images/1088372392945045505/3JOuR2pY.jpg"

const help = (PREFIX, author) => {
    let embed = new Discord.MessageEmbed()
    .setTitle(`${AUTOCHESS_TITLE} - Commands`)
    .setAuthor(`${author}`)
    .setDescription(`Following commands are available:`)
    .addField(`${PREFIX}acrace NAME`, `Random hero pick [RACE]`)
    .addField(`${PREFIX}acclass NAME`, `Random hero pick [CLASS]`)
    .addField(`${PREFIX}acany NAME`, `Random hero pick [RACE/CLASS]`)
    .setThumbnail(LOGO_URL);

    return embed;
}

const raceForMessage = (message) => {
    let msgArguments = message.content.split(" ");

    var playerCounter = msgArguments.length;
    if (playerCounter > 1) {
        // more than one player
        // ignore first
        playerCounter--;
    } else {
        playerCounter++
    }

    // get synergy
    let synergyList = service.getRandomRace(playerCounter);
    sendSynergyMessages(message, msgArguments, synergyList);
    
} 

const classForMessage = (message) => {
    let msgArguments = message.content.split(" ");

    var playerCounter = msgArguments.length;
    if (playerCounter > 1) {
        // more than one player
        // ignore first
        playerCounter--;
    } else {
        playerCounter++
    }

    // get synergy
    let synergyList = service.getRandomClass(playerCounter);
    sendSynergyMessages(message, msgArguments, synergyList);
    
} 

const synergyForMessage = (message) => {
    let msgArguments = message.content.split(" ");

    var playerCounter = msgArguments.length;
    if (playerCounter > 1) {
        // more than one player
        // ignore first
        playerCounter--;
    } else {
        playerCounter++
    }

    // get synergy
    let synergyList = service.getRandomSynergy(playerCounter);
    sendSynergyMessages(message, msgArguments, synergyList);
    
} 

function sendSynergyMessages(message, msgArguments, synergyList) {

    var playerPick = [];

    let userData = message.mentions.users;

    for (var i=0;i<msgArguments.length-1; i++) {
        let synergy = synergyList[i];
        var player = msgArguments[i+1];
        var pick = {};

        let key = player.replace(/[\\<>@#&!]/g, "");
        if (player.match(/\<\@.*\>/g)) {
            player = userData.get(key).username;
        }

        pick['player'] = player;
        pick['synergy'] = synergy;
        playerPick.push(pick);
    }

    // write a message for every name
    writePlayerSynergy(message, playerPick);
}

function writePlayerSynergy(message, playerPick) {
    if (playerPick.length > 0) {
        var pick = playerPick.shift();

        // player
        var player = pick['player'];

        let d = new Discord.MessageEmbed();
        d.setTitle(`${AUTOCHESS_TITLE} - Synergy Pick`);
        d.setDescription("$1, try $2 [$3]".replace("$1", player).replace("$2", pick['synergy']).replace("[$3]", "synergy"));
        d.setThumbnail(service.getIconUrl(pick['synergy']));
        message.channel.send(d).then(async function (message) {
            // write next player
            writePlayerSynergy(message, playerPick);
        });
    }
}

//export
module.exports = {
    getHelpMessage: help,
    getRandomRace: raceForMessage,
    getRandomClass: classForMessage,
    getRandomSynergy:synergyForMessage
};