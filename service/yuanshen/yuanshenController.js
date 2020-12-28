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
        .addField(`${PREFIX}gboss`, 'Bossdrop für Talente')
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
    const callback = function (entry, count) {
        const d = new Discord.MessageEmbed();
        d.setTitle(`${YUANSHEN_TITLE} - Figurenliste [${count}]`);
        d.addField('Verfügbare Figuren', entry);
        d.setThumbnail(LOGO_URL);
        message.channel.send(d);
    };

    const resultCallback = function (entries) {
        var list = '';
        for (var i = 0; i < entries.length; i++) {
            const name = entries[i].name;
            var element = '';
            if (entries[i].element !== '') {
                element = ` [${entries[i].element}]`;
            }
            list = `${list} ${name}${element}\n`;
        }
        callback(list, entries.length);
    };

    service.getAllFigures(resultCallback);
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
            d.setFooter('🎂 Unbekannt', figure.element_image_url);
        } else {
            d.setFooter(`🎂 ${figure.birthday}`, figure.element_image_url);
        }
    }

    message.channel.send(d);
}

const sendToday = (message) => {
    const d = new Discord.MessageEmbed();
    d.setTitle(`${YUANSHEN_TITLE} - Heute verfügbar`);
    d.setThumbnail(LOGO_URL);

    const callback = function (locations, figures, talents, weapon_drops) {
        for (var l = 0; l < locations.length; l++) {
            for (var t = 0; t < talents.length; t++) {
                var location = locations[l];
                var talent = talents[t];

                if (location.lid === talent.lid) {

                    var figureListname = '';
                    for (var f = 0; f < figures.length; f++) {
                        if (figures[f].talent_id === talent.tid) {
                            // console.log(figures[f].name);
                            if (figureListname === '') {
                                figureListname = figures[f].name;
                            } else {
                                figureListname = `${figureListname}\n${figures[f].name}`;
                            }
                        }
                    }
                    d.addField(`Talent ${talent.name} - ${talent.location}`, figureListname);
                }
            }
        }
        for (var lp = 0; lp < locations.length; lp++) {
            var wpLocation = locations[lp];
            for (var wp = 0; wp < weapon_drops.length; wp++) {
                var weapon = weapon_drops[wp];

                if (wpLocation.lid === weapon.location_id) {
                    d.addField(`Waffendrop - ${weapon.name}`, `in ${wpLocation.name}`);
                }
            }
        }
        message.channel.send(d);
    };

    service.getToday(callback);
};

const boss = (message) => {

    const callback = function (bosslist, bossdrops, figures) {
        // group all drops together based on boss
        var bossmap = {};
        var bossdropNames = {};

        for (var bd = 0; bd < bossdrops.length; bd++) {
            bossdropNames[bd] = bossdrops[bd].name;
            const bdkey = `${bossdrops[bd].boss_id}`;
            var bossdropsforBoss = [];
            if (Object.prototype.hasOwnProperty.call(bossmap, bdkey)) {
                bossdropsforBoss = bossmap[bdkey];
            }
            bossdropsforBoss.push(bossdrops[bd].bdid);

            bossmap[bdkey] = bossdropsforBoss;
        }


        // group all figures together for displaying (base on drop id)
        var bossdropfiguremap = {};

        for (var f = 0; f < figures.length; f++) {
            const key = `${figures[f].bdid}`;
            var bossdropindex = '';
            if (Object.prototype.hasOwnProperty.call(bossdropfiguremap, key)) {
                bossdropindex = bossdropfiguremap[key] + ', ' + figures[f].name;
            } else {
                bossdropindex = figures[f].name;
            }

            bossdropfiguremap[key] = bossdropindex;
        }

        // send a message for each boss
        sendMessageForWeeklyBoss(message, bosslist, bossdropNames, bossmap, bossdropfiguremap);

    };
    service.getBoss(callback);
};

const sendMessageForWeeklyBoss = (message, bosslist, bossdropNames, bossdrops, figures) => {
    if (bosslist.length > 0) {
        const boss = bosslist.shift();

        const d = new Discord.MessageEmbed();
        d.setTitle(`${boss.name} - ${boss.description}`);
        d.setFooter(`in ${boss.location}`);
        d.setThumbnail(boss.image_url);

        const drops = bossdrops[`${boss.bid}`];

        for (var dp = 0; dp < drops.length; dp++) {
            const dropname = bossdropNames[`${drops[dp] - 1}`];
            d.addField(dropname, figures[`${drops[dp]}`]);
        }

        message.channel.send(d).then(async function (message) {
            // write next player
            sendMessageForWeeklyBoss(message, bosslist, bossdropNames, bossdrops, figures);
        });
    }
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

    const callback = function (elements) {
        sendElementMessages(message, msgArguments, elements);
    };

    // get element
    service.getRandomElement(playerCounter, callback);
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

    const callback = function (weapons) {
        sendElementMessages(message, msgArguments, weapons);
    };

    // get weapon
    service.getRandomWeapon(playerCounter, callback);
};

const randomDungeon = (message) => {

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
        d.setDescription('$1, spiel mal $2'.replace('$1', player).replace('$2', pick.element.name));
        d.setThumbnail(pick.element.image_url);
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
    sendToday: sendToday,
    sendBoss: boss,
    sendRandomDungeon: randomDungeon,
    sendRandomElement: randomElement,
    sendRandomWeapon: randomWeapon
};
