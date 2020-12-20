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

    const figureCounter = msgArguments.length - 1;

    if (figureCounter > 0) {
        const callback = function (entry) {
            sendFigureMessage(message, entry);
        };

        var name = msgArguments[1];

        // exception handling
        if (name.toLowerCase() === 'childe') {
            name = 'tartaglia';
        }
        if (name.toLowerCase() === 'sucrose') {
            name = 'saccharose';
        }

        service.getFigure(name, callback);
    } else {
        // missing argument
    }
};

const figurelist = (message) => {
    const callback = function (entry) {
        const d = new Discord.MessageEmbed();
        d.setTitle(`${YUANSHEN_TITLE} - Figurenliste [${service.getFiguresCount()}]`);
        d.addField('Verfügbare Figuren', entry);
        d.setThumbnail(LOGO_URL);
        message.channel.send(d);
    };

    service.getAllFigures(callback);
};

function sendFigureMessage (message, figure) {
    const d = new Discord.MessageEmbed();
    d.setTitle(`${YUANSHEN_TITLE} - ${figure.name}`);
    d.setDescription(service.getStarrating(figure.rarity));
    d.setThumbnail(figure.image_url);
    d.addField('Waffe', figure.weapon);

    if (figure.talent != null && figure.talent !== '') {
        d.addField(`Talent Bücher [${service.findTalentWeekday(figure.talent)}]`, figure.talent);
    }

    // weekly boss drop
    if (figure.boss_drop_id != null && figure.boss_drop_id !== '') {
        d.addField(`Wochenboss - ${service.findWeeklyBoss(figure.boss_drop)}`, figure.boss_drop);
    }

    // footer
    if (figure.element === '') {
        if (figure.birthday === '') {
            // no birthday and no element
        } else {
            d.setFooter(`🎂 ${figure.birthday}`);
        }
    } else {
        if (figure.birthday == null || figure.birthday === '') {
            d.setFooter('🎂 Unbekannt', service.getElementIconUrl(figure.element.toLowerCase()));
        } else {
            d.setFooter(`🎂 ${figure.birthday}`, service.getElementIconUrl(figure.element.toLowerCase()));
        }
    }

    // d.setImage(service.getElementIconUrl(figure.element.toLowerCase()));
    message.channel.send(d);
    // .then(async function (message) {
    //     // write next player
    //     sendFigureMessage(message, figurelist);
    // });
}

const today = () => {
    const d = new Discord.MessageEmbed();
    d.setTitle(`${YUANSHEN_TITLE} - Heute verfügbar`);
    d.setThumbnail(LOGO_URL);

    const data = service.getToday();
    for (var i = 0; i < Object.keys(data.talent).length; i++) {
        const talentdata = data.talent[Object.keys(data.talent)[i]];
        d.addField(`Talent ${talentdata.name} - ${talentdata.location}`, talentdata.figures);
    }

    for (var j = 0; j < Object.keys(data.weapon).length; j++) {
        const weapondata = data.weapon[Object.keys(data.weapon)[j]];
        d.addField(`Waffendrop - ${weapondata.name}`, `in ${weapondata.location}`);
    }

    return d;
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
    sendFigure: figureForMessage,
    sendFigurelist: figurelist,
    getToday: today,
    sendRandomElement: randomElement,
    sendRandomWeapon: randomWeapon
};
