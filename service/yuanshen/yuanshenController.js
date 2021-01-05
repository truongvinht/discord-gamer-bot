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
        .addField(`${PREFIX}gdungeon NAME`, 'Zufallsgenerator Dungeon/Sphäre')
        .addField(`${PREFIX}gartifactset`, 'Liste aller Artifaktsets (5 Sterne)')
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
        // missing argument: random figure
        const resultCallback = function (entries) {
            const pickedIndex = Math.floor(Math.random() * Math.floor(entries.length));
            const figure = entries[pickedIndex].name;

            const callback = function (entry) {
                message.channel.send(`Zufallsfigur für ${message.author.username}`).then(async function (message) {
                    sendFigureMessage(message, entry);
                });
            };

            service.getFigure(figure, callback);
        };
        service.getAllFigures(resultCallback);
    }
};

const figurelist = (message) => {
    const callback = function (entry, count) {
        const d = new Discord.MessageEmbed();
        d.setTitle(`Figurenliste [${count}]`);
        d.addField('Verfügbare Figuren', entry);
        d.setFooter(YUANSHEN_TITLE);
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
    if (figure.talent != null && figure.talent !== '') {
        const talentCallback = function (weekdays) {
            const d = new Discord.MessageEmbed();
            d.setTitle(`${figure.name}`);
            d.setDescription(service.getStarrating(figure.rarity));
            d.setThumbnail(figure.image_url);
            d.addField('Waffe', figure.weapon);

            if (weekdays != null && weekdays.length > 0) {
                var weekdaysnames = null;

                for (var days = 0; days < weekdays.length; days++) {
                    if (weekdaysnames == null) {
                        weekdaysnames = weekdays[days].weekday_short;
                    } else {
                        weekdaysnames = `${weekdaysnames}, ${weekdays[days].weekday_short}`;
                    }
                }
                d.addField(`Talent Bücher [${weekdaysnames}]`, figure.talent);
            }
            // weekly boss drop
            if (figure.boss_drop_id != null && figure.boss_drop_id !== '') {
                d.addField(`Wochenboss - ${figure.boss}/${figure.boss_description}`, figure.boss_drop);
            }

            // footer
            if (figure.element === '') {
                if (figure.birthday === '') {
                    // no birthday and no element
                } else {
                    d.setFooter(`🎂 ${figure.birthday} - ${YUANSHEN_TITLE}`);
                }
            } else {
                if (figure.birthday == null || figure.birthday === '') {
                    d.setFooter(`🎂 Unbekannt - ${YUANSHEN_TITLE}`, figure.element_image_url);
                } else {
                    d.setFooter(`🎂 ${figure.birthday} - ${YUANSHEN_TITLE}`, figure.element_image_url);
                }
            }
            message.channel.send(d);
        };
        service.getTalentByWeekday(figure.tid, talentCallback);
    } else {
        const d = new Discord.MessageEmbed();
        d.setTitle(`${figure.name}`);
        d.setDescription(service.getStarrating(figure.rarity));
        d.setThumbnail(figure.image_url);
        d.addField('Waffe', figure.weapon);

        // weekly boss drop
        if (figure.boss_drop_id != null && figure.boss_drop_id !== '') {
            d.addField(`Wochenboss - ${figure.boss}/${figure.boss_description}`, figure.boss_drop);
        }

        // footer
        if (figure.element === '') {
            if (figure.birthday === '') {
                // no birthday and no element
            } else {
                d.setFooter(`🎂 ${figure.birthday} - ${YUANSHEN_TITLE}`);
            }
        } else {
            if (figure.birthday == null || figure.birthday === '') {
                d.setFooter(`🎂 Unbekannt - ${YUANSHEN_TITLE}`, figure.element_image_url);
            } else {
                d.setFooter(`🎂 ${figure.birthday} - ${YUANSHEN_TITLE}`, figure.element_image_url);
            }
        }
        message.channel.send(d);
    }
};

const sendToday = (message) => {
    const d = new Discord.MessageEmbed();
    d.setTitle('Heute verfügbar');
    d.setThumbnail(LOGO_URL);
    d.setFooter(`${YUANSHEN_TITLE}`);

    const callback = function (locations, figures, talents, weaponDrops) {
        summarizedDataForDate(d, locations, figures, talents, weaponDrops);
        message.channel.send(d);
    };

    service.getToday(callback);
};

const sendYesterday = (message) => {
    const d = new Discord.MessageEmbed();
    d.setTitle('Gestern verfügbar');
    d.setThumbnail(LOGO_URL);
    d.setFooter(`${YUANSHEN_TITLE}`);

    const callback = function (locations, figures, talents, weaponDrops) {
        summarizedDataForDate(d, locations, figures, talents, weaponDrops);
        message.channel.send(d);
    };
    const date = new Date();
    var weekday = date.getDay(); // 0-6 Sonntag - Samstag

    // override Sunday as 7
    if (weekday === 0) {
        weekday = 6;
    } else if (weekday === 1) {
        weekday = 7;
    } else {
        weekday = weekday - 1;
    }

    service.getSelectedDay(weekday, callback);
};

const sendTomorrow = (message) => {
    const d = new Discord.MessageEmbed();
    d.setTitle('Morgen verfügbar');
    d.setThumbnail(LOGO_URL);
    d.setFooter(`${YUANSHEN_TITLE}`);

    const callback = function (locations, figures, talents, weaponDrops) {
        summarizedDataForDate(d, locations, figures, talents, weaponDrops);
        message.channel.send(d);
    };
    const date = new Date();
    var weekday = date.getDay() + 1; // 0-6 Sonntag - Samstag
    service.getSelectedDay(weekday, callback);
};

function summarizedDataForDate (d, locations, figures, talents, weaponDrops) {
    for (var l = 0; l < locations.length; l++) {
        for (var t = 0; t < talents.length; t++) {
            var location = locations[l];
            var talent = talents[t];

            if (location.lid === talent.lid) {
                var figureListname = '';
                for (var f = 0; f < figures.length; f++) {
                    if (figures[f].talent_id === talent.tid) {
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
        for (var wp = 0; wp < weaponDrops.length; wp++) {
            var weapon = weaponDrops[wp];

            if (wpLocation.lid === weapon.location_id) {
                d.addField(`Waffendrop - ${weapon.name}`, `in ${wpLocation.name}`);
            }
        }
    }
}

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
    if (msgArguments.length > 1) {
        // more than one player
        // ignore first

        const callback = function (elements) {
            sendElementMessages(message, msgArguments, elements);
        };

        // get element
        service.getRandomElement(msgArguments.length, callback);
    } else {
        const callback = function (elements) {
            sendElementMessages(message, [message.author.username, message.author.username], elements);
        };

        // get element
        service.getRandomElement(1, callback);
    }
};

const random = (message) => {
    randomElement(message);
    randomWeapon(message);
};

const randomWeapon = (message) => {
    const msgArguments = message.content.split(' ');
    if (msgArguments.length > 1) {
        // more than one player
        // ignore first
        const callback = function (weapons) {
            sendElementMessages(message, msgArguments, weapons);
        };
        // get weapon
        service.getRandomWeapon(msgArguments.length, callback);
    } else {
        const callback = function (weapons) {
            sendElementMessages(message, [message.author.username, message.author.username], weapons);
        };
        // get weapon
        service.getRandomWeapon(1, callback);
    }
};

const randomDungeon = (message) => {
    const msgArguments = message.content.split(' ');

    if (msgArguments.length > 1) {
        const callback = function (dungeon) {
            sendDungeonMessage(message, msgArguments, dungeon);
        };
        service.getRandomDungeon(callback);
    } else {
        const callback = function (dungeon) {
            sendDungeonMessage(message, [message.author.username, message.author.username], dungeon);
        };
        service.getRandomDungeon(callback);
    }
};

function sendDungeonMessage (message, msgArguments, dungeon) {
    var playerPick = [];

    const userData = message.mentions.users;

    for (var i = 0; i < msgArguments.length - 1; i++) {
        var player = msgArguments[i + 1];

        const key = player.replace(/[\\<>@#&!]/g, '');
        // eslint-disable-next-line no-useless-escape
        if (player.match(/\<\@.*\>/g)) {
            player = userData.get(key).username;
        }

        playerPick.push(player);
    }

    // player
    const playername = playerPick.shift();

    const d = new Discord.MessageEmbed();
    d.setTitle('Sphäre');
    d.setDescription('$1, versuch mal $2'.replace('$1', playername).replace('$2', dungeon.name));
    d.setThumbnail(dungeon.image_url);
    d.setFooter(`in ${dungeon.location} - ${YUANSHEN_TITLE}`);
    message.channel.send(d);
};

const artifact = (message) => {
    // arguments
    const msgArguments = message.content.split(' ');
    const callback = function (artifactset) {
        if (msgArguments.length > 1) {
            sendArtifactMessage(message, msgArguments[1], artifactset);
        } else {
            sendArtifactListMessage(message, artifactset);
        }
    };

    // get weapon
    service.getArtifactset(callback);
};
function sendArtifactListMessage (message, list) {
    const d = new Discord.MessageEmbed();
    d.setTitle('Liste der Artifakte');
    for (var a = 0; a < list.length; a++) {
        const af = list[a];
        if (af.dungeon == null) {
            d.addField(`${a + 1}: ${af.name}`, '-');
        } else {
            d.addField(`${a + 1}: ${af.name}`, af.dungeon);
        }
    }
    d.setFooter(YUANSHEN_TITLE);
    message.channel.send(d);
}

function sendArtifactMessage (message, index, sets) {
    const position = parseInt(index) - 1;
    if (Object.keys(sets).length < position) {
        return;
    }
    const pick = sets[position];
    const d = new Discord.MessageEmbed();
    d.setTitle(`${pick.name}`);
    if (pick.dungeon != null) {
        d.setFooter(`${pick.dungeon} - ${YUANSHEN_TITLE}`, pick.dungeon_image_url);
    } else {
        d.setFooter(YUANSHEN_TITLE);
    }
    if (pick.one_set != null) {
        d.addField('1-Set', pick.one_set);
    }
    if (pick.two_set != null) {
        d.addField('2-Set', pick.two_set);
    }
    if (pick.four_set != null) {
        d.addField('4-Set', pick.four_set);
    }
    d.setThumbnail(pick.image_url);
    message.channel.send(d);
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
        d.setTitle('Zufallsgenerator');
        d.setFooter(YUANSHEN_TITLE);
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
    sendYesterday: sendYesterday,
    sendTomorrow: sendTomorrow,
    sendBoss: boss,
    sendRandomDungeon: randomDungeon,
    sendRandomElement: randomElement,
    sendRandomWeapon: randomWeapon,
    sendRandom: random,
    sendArtifact: artifact
};
