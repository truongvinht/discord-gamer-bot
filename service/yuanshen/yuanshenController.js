// yuanshenController.js
// Controller to prepare content for discord response
// ================

const Discord = require('discord.js');
const service = require('./yuanshenService');
const YUANSHEN_TITLE = 'Genshin Impact';
const LOGO_URL = 'https://webstatic-sea.mihoyo.com/upload/event/2020/11/06/f28664c6712f7c309ab296f3fb6980f3_698588692114461869.png';

const help = (PREFIX, author) => {
    const embed = new Discord.MessageEmbed()
        .setTitle(`${YUANSHEN_TITLE} - Commands`)
        .setAuthor(`${author}`)
        .setDescription('Folgende Befehle sind verfügbar:')
        .addField(`${PREFIX}gtoday`, 'Heute farmbar')
        .addField(`${PREFIX}glist`, 'Liste aller Figuren')
        .addField(`${PREFIX}gfigure NAME`, 'Figurendetails')
        .addField(`${PREFIX}gelement NAME`, 'Zufallsgenerator Elemente')
        .addField(`${PREFIX}gweapon NAME`, 'Zufallsgenerator Waffe')
        .setThumbnail(LOGO_URL);

    return embed;
};

const figureForMessage = (message) => {
    const msgArguments = message.content.split(' ');

    var figureCounter = msgArguments.length;
    if (figureCounter > 1) {
        // more than one figure
        // ignore first
        figureCounter--;
    } else {
        figureCounter++;
    }

    var figureDataList = [];

    // collect name list
    for (var i = 0; i < msgArguments.length - 1; i++) {
        const figureinfo = service.getFigure(msgArguments[i + 1]);
        figureDataList.push(figureinfo);
    }

    sendFigureMessage(message, figureDataList);
};

const figurelist = (message) => {
    const d = new Discord.MessageEmbed();
    d.setTitle(`${YUANSHEN_TITLE} - Figurenliste [${service.getFiguresCount()}]`);
    d.addField('Verfügbare Figuren', service.getAllFigures());
    d.setThumbnail(LOGO_URL);
    message.channel.send(d);
};

function sendFigureMessage (message, figurelist) {
    if (figurelist.length > 0) {
        var figure = figurelist.shift();

        const d = new Discord.MessageEmbed();
        d.setTitle(`${YUANSHEN_TITLE} - ${figure.name}`);
        d.setDescription(service.getStarrating(figure.rarity));
        d.setThumbnail(figure.image);
        d.addField('Waffe', figure.weapon);
        d.addField('Talent Bücher', figure.talent);
        d.setFooter(`🎂 ${figure.birthday}`, service.getElementIconUrl(figure.element.toLowerCase()));
        // d.setImage(service.getElementIconUrl(figure.element.toLowerCase()));
        message.channel.send(d).then(async function (message) {
            // write next player
            sendFigureMessage(message, figurelist);
        });
    }
}

const today = (message) => {
    const d = new Discord.MessageEmbed();
    d.setTitle(`${YUANSHEN_TITLE} - Heute verfügbar`);
    d.setThumbnail(LOGO_URL);
    message.channel.send(d);
};

const randomElement = (message) => {
    const msgArguments = message.content.split(' ');

    var playerCounter = msgArguments.length;
    if (playerCounter > 1) {
        // more than one player
        // ignore first
        playerCounter--;
    } else {
        playerCounter++;
    }

    // get element
    const elementList = service.getRandomElement(playerCounter);
    sendElementMessages(message, msgArguments, elementList);
};

const randomWeapon = (message) => {
    const msgArguments = message.content.split(' ');

    var playerCounter = msgArguments.length;
    if (playerCounter > 1) {
        // more than one player
        // ignore first
        playerCounter--;
    } else {
        playerCounter++;
    }

    // get weapon
    const weaponList = service.getRandomWeapon(playerCounter);
    sendElementMessages(message, msgArguments, weaponList);
};

function sendElementMessages (message, msgArguments, elementList) {
    var playerPick = [];

    const userData = message.mentions.users;

    for (var i = 0; i < msgArguments.length - 1; i++) {
        const element = elementList[i];
        var player = msgArguments[i + 1];
        var pick = {};

        const key = player.replace(/[\\<>@#&!]/g, '');
        // eslint-disable-next-line no-useless-escape
        if (player.match(/\<\@.*\>/g)) {
            player = userData.get(key).username;
        }

        pick.player = player;
        pick.element = element;
        playerPick.push(pick);
    }

    // write a message for every name
    writePlayerPick(message, playerPick);
}

function writePlayerPick (message, playerPick) {
    if (playerPick.length > 0) {
        var pick = playerPick.shift();

        // player
        var player = pick.player;

        const d = new Discord.MessageEmbed();
        d.setTitle(`${YUANSHEN_TITLE} - Zufallsgenerator`);
        d.setDescription('$1, spiel mal $2'.replace('$1', player).replace('$2', pick.element));
        d.setThumbnail(service.getElementIconUrl(pick.element.toLowerCase()));
        message.channel.send(d).then(async function (message) {
            // write next player
            writePlayerPick(message, playerPick);
        });
    }
}

// export
module.exports = {
    getHelpMessage: help,
    getFigure: figureForMessage,
    getFigurelist: figurelist,
    getToday: today,
    getRandomElement: randomElement,
    getRandomWeapon: randomWeapon
};
