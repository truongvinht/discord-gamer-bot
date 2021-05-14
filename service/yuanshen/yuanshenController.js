// yuanshenController.js
// Controller to prepare content for discord response
// ================

const Discord = require('discord.js');
const nodeHtmlToImage = require('node-html-to-image');
const ApiService = require('./service/yuanshenService');

const draft = require('./yuanshenDraftHandler');
const imgGen = require('./service/imageGeneratorService');
const c = require('../../helper/envHandler');

const YUANSHEN_TITLE = 'Genshin Impact';
const LOGO_URL = 'https://webstatic-sea.mihoyo.com/upload/event/2020/11/06/f28664c6712f7c309ab296f3fb6980f3_698588692114461869.png';

let yuanshenApiService = null;

function getApiService () {
    if (yuanshenApiService == null) {
        yuanshenApiService = new ApiService(c.yuanshenServer, c.yuanshenToken);
    }
    return yuanshenApiService;
}

const help = (PREFIX, author) => {
    const embed = new Discord.MessageEmbed()
        .setTitle(`${YUANSHEN_TITLE} - Commands`)
        .setAuthor(`${author}`)
        .setDescription('Folgende Befehle sind verfügbar:')
        .addField(`${PREFIX}gtoday / ${PREFIX}gtomorrow`, 'Heute/Morgen farmbar')
        .addField(`${PREFIX}glist`, 'Liste aller Figuren')
        .addField(`${PREFIX}gfigure NAME`, 'Figurendetails')
        .addField(`${PREFIX}grandom SPIELER-NAME`, 'Zufallsgenerator für SPIELER-NAME (Element/Waffe)')
        .addField(`${PREFIX}gboss`, 'Bossdrop für Talente')
        .addField(`${PREFIX}gdungeon`, 'Zufallsgenerator Dungeon/Sphäre')
        .addField(`${PREFIX}gartifactset`, 'Liste aller Artifaktsets (5 Sterne)')
        .addField(`${PREFIX}gtalent`, 'Liste aller Talentbücher')
        .addField(`${PREFIX}gchallenge SPIELER-NAME`, 'Zufällige Challenge gegen einen Boss')
        .setThumbnail(LOGO_URL);

    return embed;
};

const figureForMessage = (message) => {
    message.channel.startTyping();
    const msgArguments = message.content.split(' ');

    const figureCounter = msgArguments.length - 1;

    if (figureCounter > 0) {
        const callback = function (entry, _) {
            if (entry !== null && Object.prototype.hasOwnProperty.call(entry, 'entry')) {
                sendFigureMessage(message, entry.entry);
            }
        };

        var name = msgArguments[1];

        if (msgArguments.length === 3) {
            const secondName = msgArguments[2];
            if (name.toLowerCase() === 'hu' && secondName.toLowerCase() === 'tao') {
                name = 'hu tao';
            }
        }

        getApiService().singleFigure(callback, name);
    } else {
        // missing argument: random figure
        const resultCallback = function (entries, err) {
            const pickedIndex = Math.floor(Math.random() * Math.floor(entries.length));
            const figure = entries[pickedIndex].name;

            const callback = function (entry, _) {
                message.channel.send(`Zufallsfigur für ${message.author.username}`).then(async function (message) {
                    const object = entry.entry;
                    sendFigureMessage(message, object);
                });
            };

            getApiService().singleFigure(callback, figure);
        };
        getApiService().allFigures(resultCallback);
    }
};

const figurelist = (message) => {
    message.channel.startTyping();
    const callback = function (entry, count) {
        const d = new Discord.MessageEmbed();
        d.setTitle(`Figurenliste [${count}]`);
        d.addField('Verfügbare Figuren', entry);
        d.setFooter(YUANSHEN_TITLE);
        d.setThumbnail(LOGO_URL);
        message.channel.send(d).then(async function (msg) {
            msg.channel.stopTyping();
        });
    };

    const resultCallback = function (entries, err) {
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
    getApiService().allFigures(resultCallback);
};

const figureDraft = (message) => {
    // select 2 out of 10 for banning and then next 10 will shown until 8 are left
    message.channel.startTyping();

    const resultCallback = function (entries) {
        var list = [];
        for (var i = 0; i < entries.length; i++) {
            const name = entries[i].name;

            if (name !== 'Traveler') {
                list.push(name);
            }
        }

        // 1. fill draft list
        draft.resetFigures(list);

        // 2. get draft list (10 entries)
        const batch = draft.getDraftBatch(10);

        const d = new Discord.MessageEmbed();
        d.setTitle('Figuren Draft Modus');
        d.setColor('#008000');
        d.setDescription(`${list.length} Figuren verfügbar`);

        for (var dr = 0; dr < batch.length; dr++) {
            const name = batch[dr];
            d.addField(name, '\u200B');
        }

        d.setFooter(YUANSHEN_TITLE);
        d.setThumbnail(LOGO_URL);
        message.channel.send(d);
    };

    // 0. init draft list
    getApiService.allFigures(resultCallback);
};

const figureTalent = (message) => {
    message.channel.startTyping();
    const callback = function (talents, figures, schedule) {
        // prepare list of entries
        var talentList = [];

        for (var i = 0; i < talents.length; i++) {
            var t = {};
            const talent = talents[i];
            t['name'] = talent.name;
            t['location'] = talent.location;
            t['image_url'] = talent.image_url;

            var names = [];
            for (var j = 0; j < figures.length; j++) {
                const fig = figures[j];
                if (talent["tid"] === fig["talent_id"]) {
                    names.push(fig.name);
                }
            }
            t["figures"] = names;
            var schedules = [];

            for (var k = 0; k < schedule.length; k++) {
                const s = schedule[k];
                if (talent["tid"] === s["talent_id"]) {
                    schedules.push(s.day);
                }
            }
            t["schedules"] = schedules;
            talentList.push(t);
        }
        sendMessageForTalents(message, talentList);
    };

    getApiService().talent(callback);
};

const sendMessageForTalents = (message, talentList) => {
    if (talentList.length > 0) {
        const talent = talentList.shift();

        const d = new Discord.MessageEmbed();
        d.setTitle(`${talent.name} in ${talent.location}`);

        d.setDescription(talent.schedules.join())
        d.addField(`Figuren (${talent.figures.length})`,talent.figures.join())
        d.setThumbnail(talent.image_url);

        message.channel.send(d).then(async function (message) {
            // write next player
            sendMessageForTalents(message, talentList);
        });
    } else {
        message.channel.stopTyping();
    }
};

async function sendAsyncMessage (message, figure, weekdays) {

    const figureContentPage = imgGen.generateFigureContentPage(figure, weekdays);

    const myImage = await nodeHtmlToImage({
        html: figureContentPage,
        quality: 100,
        type: 'jpeg',
        puppeteerArgs: {
            args: ['--no-sandbox']
        },
        encoding: 'buffer'
    });
    const d = new Discord.MessageEmbed();
    d.setTitle(`${figure.name}`);
    d.setDescription(getRating(figure.rarity));
    d.setThumbnail(figure.image_url);

    let name = figure.name;
    name = name.split(' ').join('_');

    const attachment = new Discord.MessageAttachment(myImage, `${name}.jpg`);
    d.attachFiles(attachment);

    d.setImage(`attachment://${name}.jpg`);

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
    message.channel.stopTyping();
}

function sendMinFigureMessage (message, figure) {
    const d = new Discord.MessageEmbed();
    d.setTitle(`${figure.name}`);
    d.setDescription(getRating(figure.rarity));
    d.setThumbnail(figure.image_url);

    message.channel.send(d).then(async function (msg) {
        msg.channel.stopTyping();
    });
};

function sendFigureMessage (message, figure) {
    if (figure.talent != null && figure.talent !== '') {
        const talentCallback = function (weekdays, _) {
            sendAsyncMessage(message, figure, weekdays);
        };
        getApiService().allWeekdaysForTalent(talentCallback, figure.tid);
    } else {
        const d = new Discord.MessageEmbed();
        d.setTitle(`${figure.name}`);
        d.setDescription(getRating(figure.rarity));
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
        message.channel.send(d).then(async function (msg) {
            msg.channel.stopTyping();
        });
    }
};

const sendToday = (message) => {
    message.channel.startTyping();
    const d = new Discord.MessageEmbed();
    d.setTitle('Heute verfügbar');
    d.setThumbnail(LOGO_URL);
    d.setFooter(`${YUANSHEN_TITLE}`);

    const callback = function (locations, talents, figures, weaponDrops, error) {
        summarizedDataForDate(d, locations, figures, talents, weaponDrops);
        message.channel.send(d).then(async function (msg) {
            msg.channel.stopTyping();
        });
    };

    const date = new Date();
    const weekday = date.getDay(); // 0-6 Sonntag - Samstag
    getApiService().ressourcesForWeekday(callback, weekday);
};

const sendYesterday = (message) => {
    message.channel.startTyping();
    const d = new Discord.MessageEmbed();
    d.setTitle('Gestern verfügbar');
    d.setThumbnail(LOGO_URL);
    d.setFooter(`${YUANSHEN_TITLE}`);

    const callback = function (locations, talents, figures, weaponDrops, error) {
        summarizedDataForDate(d, locations, figures, talents, weaponDrops);
        message.channel.send(d).then(async function (msg) {
            msg.channel.stopTyping();
        });
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

    getApiService().ressourcesForWeekday(callback, weekday);
};

const sendTomorrow = (message) => {
    message.channel.startTyping();
    const d = new Discord.MessageEmbed();
    d.setTitle('Morgen verfügbar');
    d.setThumbnail(LOGO_URL);
    d.setFooter(`${YUANSHEN_TITLE}`);

    const callback = function (locations, talents, figures, weaponDrops, error) {
        summarizedDataForDate(d, locations, figures, talents, weaponDrops);
        message.channel.send(d).then(async function (msg) {
            msg.channel.stopTyping();
        });
    };
    const date = new Date();
    const weekday = (date.getDay() + 1) % 7; // 0-6 Sonntag - Samstag
    getApiService().ressourcesForWeekday(callback, weekday);
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
    message.channel.startTyping();
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
    getApiService().boss(callback);
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
    } else {
        message.channel.stopTyping();
    }
};

const randomElement = (message) => {
    message.channel.startTyping();
    const msgArguments = message.content.split(' ');
    if (msgArguments.length > 1) {
        // more than one player
        // ignore first

        const callback = function (elements) {
            sendElementMessages(message, msgArguments, elements);
        };

        // get element
        getApiService().randomElement(callback, msgArguments.length);
    } else {
        const callback = function (elements) {
            sendElementMessages(message, [message.author.username, message.author.username], elements);
        };

        // get element
        getApiService().randomElement(callback, 1);
    }
};

const random = (message) => {
    randomElement(message);
    randomWeapon(message);
};

const randomWeapon = (message) => {
    message.channel.startTyping();
    const msgArguments = message.content.split(' ');
    if (msgArguments.length > 1) {
        // more than one player
        // ignore first
        const callback = function (weapons) {
            sendElementMessages(message, msgArguments, weapons);
        };
        // get weapon
        getApiService().randomWeapon(callback, msgArguments.length);
    } else {
        const callback = function (weapons) {
            sendElementMessages(message, [message.author.username, message.author.username], weapons);
        };
        // get weapon
        getApiService().randomWeapon(callback, 1);
    }
};

const randomDungeon = (message) => {
    const msgArguments = message.content.split(' ');

    if (msgArguments.length > 1) {
        const callback = function (dungeon) {
            sendDungeonMessage(message, msgArguments, dungeon);
        };
        getApiService().randomDungeon(callback);
    } else {
        const callback = function (dungeon) {
            sendDungeonMessage(message, [message.author.username, message.author.username], dungeon);
        };
        getApiService().randomDungeon(callback);
    }
};

const randomChallenge = (message) => {
    const msgArguments = message.content.split(' ');

    if (msgArguments.length > 1) {

        const args = msgArguments.length - 1;

        message.channel.startTyping();
        // no arguments => show only random boss
        const callback = function (dungeon) {
            sendNormalBossMessage(message, dungeon);
            message.channel.startTyping();

            // missing argument: random figure
            const resultCallback = function (entries, err) {
                const list = [];
                for (let playerCount = 0; playerCount < args; playerCount++) {
                    let pickedIndex = Math.floor(Math.random() * Math.floor(entries.length));
                    while (list.includes(pickedIndex)) {
                        pickedIndex = Math.floor(Math.random() * Math.floor(entries.length));
                    }
                    list.push(pickedIndex);
                    const figure = entries[pickedIndex].name;

                    const figCallback = function (entry, _) {
                        const object = entry.entry;
                        sendMinFigureMessage(message, object);
                    };

                    getApiService().singleFigure(figCallback, figure);
                }
            };
            getApiService().allFigures(resultCallback);
        };
        getApiService().randomNormalBoss(callback);
    } else {
        message.channel.startTyping();
        // no arguments => show only random boss
        const callback = function (dungeon) {
            sendNormalBossMessage(message, dungeon);
        };
        getApiService().randomNormalBoss(callback);
    }
};

const randomLowChallenge = (message) => {
    const msgArguments = message.content.split(' ');

    if (msgArguments.length > 1) {
        const args = msgArguments.length - 1;

        message.channel.startTyping();
        // no arguments => show only random boss
        const callback = function (dungeon) {
            sendNormalBossMessage(message, dungeon);
            message.channel.startTyping();

            // missing argument: random figure
            const resultCallback = function (entries, err) {
                const list = [];
                for (let playerCount = 0; playerCount < args; playerCount++) {
                    let pickedIndex = Math.floor(Math.random() * Math.floor(entries.length));
                    let figure = entries[pickedIndex];
                    while (list.includes(pickedIndex) || figure.rarity > 4) {
                        pickedIndex = Math.floor(Math.random() * Math.floor(entries.length));
                        figure = entries[pickedIndex];
                    }

                    list.push(pickedIndex);
                    const figCallback = function (entry, _) {
                        const object = entry.entry;
                        sendMinFigureMessage(message, object);
                    };

                    getApiService().singleFigure(figCallback, figure.name);
                }
            };
            getApiService().allFigures(resultCallback);
        };
        getApiService().randomNormalBoss(callback);
    } else {
        message.channel.startTyping();
        // no arguments => show only random boss
        const callback = function (dungeon) {
            sendNormalBossMessage(message, dungeon);
        };
        getApiService().randomNormalBoss(callback);
    }
};

function sendNormalBossMessage (message, boss) {

    const d = new Discord.MessageEmbed();
    d.setTitle('Challenge - Gegner');
    d.setDescription('Versucht es mal mit $1'.replace('$1', boss.name));
    d.setThumbnail(boss.image_url);
    d.setFooter(`in ${boss.location} - ${YUANSHEN_TITLE}`);
    message.channel.send(d).then(async function (msg) {
        msg.channel.stopTyping();
    });
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
    message.channel.send(d).then(async function (msg) {
        msg.channel.stopTyping();
    });
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
    getApiService().allArtifacts(callback);
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
    message.channel.send(d).then(async function (msg) {
        msg.channel.stopTyping();
    });
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
    message.channel.send(d).then(async function (msg) {
        msg.channel.stopTyping();
    });
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
    } else {
        message.channel.stopTyping();
    }
}
function getRating (number) {
    var stars = '';

    for (var i = 0; i < number; i++) {
        const newLocal = '★';
        stars = stars + newLocal;
    }
    return stars;
};

// export
module.exports = {
    getHelpMessage: help,
    sendFigure: figureForMessage,
    sendFigureDraft: figureDraft,
    sendFigureTalent: figureTalent,
    sendFigurelist: figurelist,
    sendToday: sendToday,
    sendYesterday: sendYesterday,
    sendTomorrow: sendTomorrow,
    sendBoss: boss,
    sendRandomDungeon: randomDungeon,
    sendRandomChallenge: randomChallenge,
    sendRandomLowChallenge: randomLowChallenge,
    sendRandomElement: randomElement,
    sendRandomWeapon: randomWeapon,
    sendRandom: random,
    sendArtifact: artifact
};
