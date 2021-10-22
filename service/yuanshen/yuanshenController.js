// yuanshenController.js
// Controller to prepare content for discord response
// ================

const Discord = require('discord.js');
const nodeHtmlToImage = require('node-html-to-image');
const ApiService = require('./service/yuanshenService');

const draft = require('./yuanshenDraftHandler');
const imgGen = require('./service/imageGeneratorService');
const c = require('../../helper/envHandler');
const DateExtension = require('../../helper/dateExtension');

const ColorManager = require('./../base/colorManager');
const colorManager = ColorManager.getInstance();

const YUANSHEN_TITLE = 'Genshin Impact';
const LOGO_URL = 'https://webstatic-sea.mihoyo.com/upload/event/2020/11/06/f28664c6712f7c309ab296f3fb6980f3_698588692114461869.png';

let yuanshenApiService = null;

function getApiService () {
    if (yuanshenApiService == null) {
        yuanshenApiService = new ApiService(c.yuanshenServer, c.yuanshenToken, c.yuanshenServerPort, false);
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
        .addField(`${PREFIX}gbanner`, 'Zeigt den aktuellen Banner an')
        .addField(`${PREFIX}gchallenge SPIELER-NAME`, 'Zufällige Challenge gegen einen Boss')
        .addField(`${PREFIX}gfm`, 'Figurenmaterial zum Aufstieg')
        .addField(`${PREFIX}glv [FIG/WP/TL] [1-89] [2-90]`, 'Berechnet die Kosten bei Level up von Figuren/Waffen/Talenten')
        .setThumbnail(LOGO_URL);

    return embed;
};

const figureForMessage = (message) => {
    message.channel.startTyping();
    const msgArguments = message.content.split(' ');

    const figureCounter = msgArguments.length - 1;

    if (figureCounter > 0) {
        const callback = function (fig, banners, error) {
            if (error == null) {
                sendFigureMessage(message, fig, banners);
            } else {
                message.channel.send('Anfrage konnte nicht ausgeführt werden. Bitte versuche es erneut.');
                message.channel.stopTyping();
            }
        };

        let name = msgArguments[1];

        if (msgArguments.length === 3) {
            const secondName = msgArguments[2];

            // combine name
            const fullName = name + ' ' + secondName;

            if (getApiService().validateLongFigureName(fullName)) {
                name = fullName;
            }
        }

        getApiService().singleFigureWithBanner(callback, name);
    } else {
        // missing argument: random figure
        const resultCallback = function (entries, err) {
            const pickedIndex = Math.floor(Math.random() * Math.floor(entries.length));
            const figure = entries[pickedIndex].name;

            const callback = function (fig, banners, error) {
                if (error == null) {
                    message.channel.send(`Zufallsfigur für ${message.author.username}`).then(async function (message) {
                        sendFigureMessage(message, fig, banners);
                    });
                } else {
                    message.channel.send('Anfrage konnte nicht ausgeführt werden. Bitte versuche es erneut.');
                    message.channel.stopTyping();
                }
            };

            getApiService().singleFigure(callback, figure);
        };
        getApiService().allFigures(resultCallback);
    }
};

const yuanshenReaction = (reaction, user) => {
    const message = reaction.message;

    // show stats for figure
    if (reaction.emoji.name === '📊') {
        if (message.embeds.length === 1) {
            const embedMessage = message.embeds[0];
            const image = embedMessage.image;

            if (image !== null) {
                const imgUrl = image.url;
                if (imgUrl !== null) {
                    const filename = imgUrl.substring(imgUrl.lastIndexOf('/') + 1);
                    const names = filename.split('.');
                    const name = names[0];
                    message.channel.startTyping();
                    const resultCallback = function (entry, err) {
                        if (err === null) {
                            sendMessageWithBaseStat(message, entry);
                        } else {
                            // do nothing
                            message.channel.send('Keine weiteren Daten verfügbar.').then(async function (msg) {
                                msg.channel.stopTyping();
                            });
                        }
                    };
                    getApiService().singleFigureDetails(resultCallback, name);
                }
            }
        }
    }
};

function sendMessageWithBaseStat (message, entry) {
    const d = new Discord.MessageEmbed();
    d.setTitle(`${entry.data.name}`);
    d.setDescription(`${entry.data.titles}`);
    d.setFooter(YUANSHEN_TITLE);
    d.setThumbnail(apiServerUrl() + entry.values.images.thumb);
    let labelsString = '';
    for (const label of entry.labels.baseStat) {
        labelsString = labelsString + label + '\n';
    }
    let hpString = '';
    for (const hp of entry.values.baseStat.characterHP) {
        hpString = hpString + hp + '\n';
    }
    let aktDefString = '';
    for (const index in entry.values.baseStat.characterATK) {
        const atk = entry.values.baseStat.characterATK[index];
        const def = entry.values.baseStat.characterDEF[index];
        aktDefString = aktDefString + atk + '|' + def + '\n';
    }
    d.addFields(
        { name: 'Lv', value: labelsString, inline: true },
        { name: 'LP', value: hpString, inline: true },
        { name: 'ANG|VTD', value: aktDefString, inline: true });

    // add special dmg
    const special = entry.values.specializeStat.key;
    if (special !== null) {
        const specialValues = entry.values.specializeStat.value;
        d.addField(special, `${specialValues[0]} - ${specialValues[specialValues.length - 1]}`);
    }
    message.channel.send(d).then(async function (msg) {
        msg.channel.stopTyping();
        await msg.react('🗑');
    });
}

const figurelist = (message) => {
    message.channel.startTyping();
    const callback = function (elements, elementCounter, count) {
        const d = new Discord.MessageEmbed();
        d.setTitle(`Figurenliste [${count}]`);
        // d.addField('Verfügbare Figuren', entry);

        const elementName = Object.keys(elements);

        // build all fields
        const elementFields = [];
        for (const element in elementName) {
            const elementTitle = elementName[element];
            const elementCount = elementCounter[elementName[element]];
            const elementMap = { name: `**${elementTitle} [${elementCount}]**`, value: elements[elementName[element]] + '\n', inline: true };
            elementFields.push(elementMap);
        }
        // 0 1 2 => 3 4 5 => 6 7 8

        for (let i = 0; i < elementFields.length; i = i + 2) {
            // all 2
            if (i + 1 < elementFields.length) {
                // only 2
                d.addFields(
                    elementFields[i],
                    elementFields[i + 1]
                );
            } else {
                // only 1
                d.addFields(
                    elementFields[i]
                );
            }
        }

        d.setFooter(YUANSHEN_TITLE);
        d.setThumbnail(LOGO_URL);
        message.channel.send(d).then(async function (msg) {
            msg.channel.stopTyping();
        });
    };

    const resultCallback = function (entries, err) {
        // let list = '';
        const elementMap = {};
        const elementCount = {};

        for (let i = 0; i < entries.length; i++) {
            const name = entries[i].name;
            const rarity = entries[i].rarity;

            // figure element
            let element = '';
            if (entries[i].element !== '') {
                element = ` ${entries[i].element}`;
            }

            let elementFigures = '';
            let elementCounter = 0;

            // load existing map
            if (Object.prototype.hasOwnProperty.call(elementMap, element)) {
                elementFigures = elementMap[element];
                elementCounter = elementCount[element];
            }

            if (rarity === 5) {
                elementFigures = `${elementFigures}★ ${name}\n`;
            } else {
                elementFigures = `${elementFigures}${name}\n`;
            }
            elementCount[element] = elementCounter + 1;
            elementMap[element] = elementFigures;

            // list = `${list} ${name}${element}\n`;
        }
        callback(elementMap, elementCount, entries.length);
    };
    getApiService().allFigures(resultCallback);
};

const figureDraft = (message) => {
    // select 2 out of 10 for banning and then next 10 will shown until 8 are left
    message.channel.startTyping();

    const resultCallback = function (entries) {
        const list = [];
        for (let i = 0; i < entries.length; i++) {
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

        for (let dr = 0; dr < batch.length; dr++) {
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
        const talentList = [];

        for (let i = 0; i < talents.length; i++) {
            const t = {};
            const talent = talents[i];
            t['name'] = talent.name;
            t['location'] = talent.location;
            t['image_url'] = talent.image_url;

            const names = [];
            for (let j = 0; j < figures.length; j++) {
                const fig = figures[j];
                if (talent['tid'] === fig['talent_id']) {
                    names.push(fig.name);
                }
            }
            t['figures'] = names;
            const schedules = [];

            for (let k = 0; k < schedule.length; k++) {
                const s = schedule[k];
                if (talent['tid'] === s['talent_id']) {
                    schedules.push(s.day);
                }
            }
            t['schedules'] = schedules;
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

        d.setDescription(talent.schedules.join());
        d.addField(`Figuren (${talent.figures.length})`, talent.figures.join());
        d.setThumbnail(talent.image_url);

        message.channel.send(d).then(async function (message) {
            // write next player
            sendMessageForTalents(message, talentList);
        });
    } else {
        message.channel.stopTyping();
    }
};

async function sendAsyncMessage (message, figure, banners, weekdays) {
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
    d.setColor(colorManager.yuanshenColor1());
    if (figure.images != null) {
        console.log(apiServerUrl() + figure.images.card);
        d.setThumbnail(apiServerUrl() + figure.images.card);
    } else {
        d.setThumbnail(figure.image_url);
    }

    const attachment = new Discord.MessageAttachment(myImage, `${figure.data_key}.jpg`);
    d.attachFiles(attachment);

    d.setImage(`attachment://${figure.data_key}.jpg`);

    // add banner information only for 5 Star
    if (banners != null && figure.rarity === 5) {
        for (const b in banners) {
            const banner = banners[b];
            d.addField(banner.title, `${DateExtension.shortCustomFormatter(banner.started_at)} - ${DateExtension.shortCustomFormatter(banner.ended_at)}`);
        }
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
        await msg.react('📊');
    });
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

async function sendAsyncFigureMessage (message, footer, figures) {
    const figureContentPage = imgGen.generateFigureOverviewPage(figures);

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
    d.setTitle('Figurenbanner: Featured');

    const attachment = new Discord.MessageAttachment(myImage, 'overview.jpg');
    d.attachFiles(attachment);

    d.setImage('attachment://overview.jpg');
    d.setFooter(footer);

    message.channel.send(d);
}

function sendFigureMessage (message, figure, banners) {
    if (figure.talent != null && figure.talent !== '') {
        // show further information from image
        const talentCallback = function (weekdays, _) {
            sendAsyncMessage(message, figure, banners, weekdays);
        };
        getApiService().allWeekdaysForTalent(talentCallback, figure.tid);
    } else {
        const d = new Discord.MessageEmbed();
        d.setTitle(`${figure.name}`);
        d.setDescription(getRating(figure.rarity));

        if (figure.images != null) {
            console.log(apiServerUrl() + figure.images.card);
            d.setThumbnail(apiServerUrl() + figure.images.card);
        } else {
            d.setThumbnail(figure.image_url);
        }
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
        if (error != null) {
            message.channel.send('Anfrage fehlgeschlagen.').then(async function (msg) {
                msg.channel.stopTyping();
            });
        } else {
            summarizedDataForDate(d, locations, figures, talents, weaponDrops);
            message.channel.send(d).then(async function (msg) {
                msg.channel.stopTyping();
            });
        }
    };

    const date = new Date();
    let weekday = date.getDay(); // 0-6 Sonntag - Samstag

    switch (weekday) {
    case 0:
        weekday = 7;
        break;
    default:
        weekday = Math.abs(weekday);
    }

    getApiService().ressourcesForWeekday(callback, weekday);
};

const sendYesterday = (message) => {
    message.channel.startTyping();
    const d = new Discord.MessageEmbed();
    d.setTitle('Gestern verfügbar');
    d.setThumbnail(LOGO_URL);
    d.setFooter(`${YUANSHEN_TITLE}`);

    const callback = function (locations, talents, figures, weaponDrops, error) {
        if (error != null) {
            message.channel.send('Anfrage fehlgeschlagen.').then(async function (msg) {
                msg.channel.stopTyping();
            });
        } else {
            summarizedDataForDate(d, locations, figures, talents, weaponDrops);
            message.channel.send(d).then(async function (msg) {
                msg.channel.stopTyping();
            });
        }
    };
    const date = new Date();
    let weekday = date.getDay(); // 0-6 Sonntag - Samstag

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
        if (error != null) {
            message.channel.send('Anfrage fehlgeschlagen.').then(async function (msg) {
                msg.channel.stopTyping();
            });
        } else {
            summarizedDataForDate(d, locations, figures, talents, weaponDrops);
            message.channel.send(d).then(async function (msg) {
                msg.channel.stopTyping();
            });
        }
    };
    const date = new Date();
    const weekday = date.getDay() + 1; // 0-6 Sonntag - Samstag
    getApiService().ressourcesForWeekday(callback, weekday);
};

function summarizedDataForDate (d, locations, figures, talents, weaponDrops) {
    for (let l = 0; l < locations.length; l++) {
        for (let t = 0; t < talents.length; t++) {
            const location = locations[l];
            const talent = talents[t];

            if (location.lid === talent.lid) {
                let figureListname = '';
                for (let f = 0; f < figures.length; f++) {
                    if (figures[f].talent_id === talent.tid) {
                        if (figureListname === '') {
                            figureListname = figures[f].name;
                        } else {
                            figureListname = `${figureListname}\n${figures[f].name}`;
                        }
                    }
                }

                if (figureListname === '') {
                    figureListname = '-';
                }
                d.addField(`Talent ${talent.name} - ${talent.location}`, figureListname);
            }
        }
    }

    for (let lp = 0; lp < locations.length; lp++) {
        const wpLocation = locations[lp];

        let weaponDropList = '';

        for (let wp = 0; wp < weaponDrops.length; wp++) {
            const weapon = weaponDrops[wp];
            if (wpLocation.lid === weapon.location_id) {
                weaponDropList = `${weaponDropList}${weapon.name}\n`;
            }
        }
        d.addField(`Waffendrop in ${wpLocation.name}`, weaponDropList);
    }
}

const boss = (message) => {
    message.channel.startTyping();
    const callback = function (bosslist, bossdrops, figures) {
        // group all drops together based on boss
        const bossmap = {};
        const bossdropNames = {};

        for (let bd = 0; bd < bossdrops.length; bd++) {
            bossdropNames[bd] = bossdrops[bd].name;
            const bdkey = `${bossdrops[bd].boss_id}`;
            let bossdropsforBoss = [];
            if (Object.prototype.hasOwnProperty.call(bossmap, bdkey)) {
                bossdropsforBoss = bossmap[bdkey];
            }
            bossdropsforBoss.push(bossdrops[bd].bdid);

            bossmap[bdkey] = bossdropsforBoss;
        }

        // group all figures together for displaying (base on drop id)
        const bossdropfiguremap = {};

        for (let f = 0; f < figures.length; f++) {
            const key = `${figures[f].bdid}`;
            let bossdropindex = '';
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

const banner = (message) => {
    // prefix
    let textPrefix = 'Aktueller ';

    const callback = function (banner, figure, error) {
        const d = new Discord.MessageEmbed();
        // check for error
        if (error == null) {
            d.setTitle(`${textPrefix}Banner - ${banner.title}`);
            d.setDescription(`Zeitraum: ${DateExtension.customFormatter(banner.started_at)} - ${DateExtension.customFormatter(banner.ended_at)}`);
            d.setImage(banner.image_url);
            d.setFooter(`${YUANSHEN_TITLE} - ${banner.gbid}. Banner`);
            message.channel.send(d).then(async function (msg) {
                msg.channel.stopTyping();
                sendAsyncFigureMessage(msg, `Zeitraum: ${DateExtension.customFormatter(banner.started_at)} - ${DateExtension.customFormatter(banner.ended_at)}`, figure);
            });
        } else {
            d.setTitle('Kein Banner gefunden!');
            d.setThumbnail(LOGO_URL);
            message.channel.send(d).then(async function (msg) {
                msg.channel.stopTyping();
            });
        }
    };

    const msgArguments = message.content.split(' ');

    if (msgArguments.length > 1) {
        // target banner: only accept integer
        if (!isNaN(msgArguments[1])) {
            textPrefix = '';
            message.channel.startTyping();
            getApiService().bannerForId(callback, parseInt(msgArguments[1]));
        }
    } else {
        // current banner
        message.channel.startTyping();
        const now = new DateExtension();
        getApiService().bannerforTime(callback, parseInt(`${now.dateToYMD()}`));
    }
};

const sendMessageForWeeklyBoss = (message, bosslist, bossdropNames, bossdrops, figures) => {
    if (bosslist.length > 0) {
        const boss = bosslist.shift();

        const d = new Discord.MessageEmbed();
        d.setTitle(`${boss.name} - ${boss.description}`);
        d.setFooter(`in ${boss.location}`);
        d.setThumbnail(boss.image_url);

        const drops = bossdrops[`${boss.bid}`];

        for (let dp = 0; dp < drops.length; dp++) {
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
                        sendMinFigureMessage(message, entry);
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
                        sendMinFigureMessage(message, entry);
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
    const playerPick = [];

    const userData = message.mentions.users;

    for (let i = 0; i < msgArguments.length - 1; i++) {
        let player = msgArguments[i + 1];

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
    for (let a = 0; a < list.length; a++) {
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

const figurematerial = (message) => {
    const d = new Discord.MessageEmbed();
    d.setTitle('Material zum Figurenaufstieg von 1-90');
    d.addField('**Boss-Broken**', '1 Splitter\n9 Bruchstücke\n 9 Brocken\n 6 \'gr. Steine\'');
    d.addField('Boss Spezialdrop', '46 Stück');
    d.addField('Regionale Besonderheit', '168 Stück (3/10/20/30/45/60)');
    d.addField('weiteres Material', '18 kl., 30 mtl., 36 gr.');
    message.channel.send(d);
};

const levelup = (message) => {
    const msgArguments = message.content.split(' ');

    const paramCounter = msgArguments.length - 1;

    if (paramCounter >= 3) {
        const type = msgArguments[1].toLowerCase();
        const start = msgArguments[2];
        const end = msgArguments[3];

        if (isNaN(start) || isNaN(end)) {
            message.channel.send('Ungültige Parameter für Level Up Befehl.');
        } else {
            const startValue = parseInt(start);
            const endValue = parseInt(end);
            if (startValue === endValue || startValue > endValue || startValue < 1 || endValue > 90) {
                // invalid input
                message.channel.send('Ungültige Parameter für Level Up Befehl. ');
            } else {
                if (type === 'fig' || type === 'f') {
                    // figure command
                    message.channel.startTyping();
                    sendFigureLevelupExpMessage(message, startValue, endValue);
                } else if (type === 'wp' || type === 'w') {
                    // weapon command
                    message.channel.startTyping();
                    sendWeaponLevelupExpMessage(message, startValue, endValue);
                } else if (type === 't' || type === 'tl' || type === 'tal') {
                    // talent command
                    message.channel.startTyping();
                    sendTalentLevelupMessage(message, startValue, endValue);
                } else {
                    message.channel.send('Ungültige Parameter für Level Up Befehl. ' + type);
                }
            }
        }
    } else {
        message.channel.send('Befehl für Level Up ist fehlgeschlagen.');
    }
};

function sendFigureLevelupExpMessage (message, start, end) {
    const callback = function (expList, levelupEntries, moraList, error) {
        const exp = expList[0].exp;
        if (error == null) {
            const d = new Discord.MessageEmbed();
            d.setThumbnail(LOGO_URL);
            d.setTitle(`Übersicht Kosten beim Leveln der Figur: ${start} - ${end}`);
            d.setFooter(YUANSHEN_TITLE);

            // 1000 exp = 200 Mora: Gruen
            // 5000 exp = 1000 Mora: Blau
            // 20 000 exp = 4000 Mora: Lila

            let moraSum = 0;
            let calculateExp = exp;

            const countLargeBooks = parseInt(calculateExp / 20000.0);
            calculateExp = calculateExp - countLargeBooks * 20000;
            const countMediumBooks = parseInt(calculateExp / 5000.0);
            calculateExp = calculateExp - countMediumBooks * 5000;
            let countSmallBooks = parseInt(calculateExp / 1000.0);
            calculateExp = calculateExp - countSmallBooks * 1000;

            if (calculateExp > 0) {
                // add small book for covering exp below 1000
                countSmallBooks = countSmallBooks + 1;
            }
            moraSum = countLargeBooks * 4000 + countMediumBooks * 1000 + countSmallBooks * 200;

            // calculate ascension
            let totalAscensionMora = 0;
            let ascensionString = '';
            for (const m in moraList) {
                const value = moraList[m];

                if (start <= value.level && end >= value.level && value.mora_ascension > 0) {
                    // is in range
                    totalAscensionMora = totalAscensionMora + value.mora_ascension;
                    ascensionString = `${ascensionString}- Level ${value.level}: ${value.mora_ascension.toLocaleString('de-de')} Mora\n`;
                }
            }

            d.addField(`Erforderliche Erfahrungspunkte [${exp.toLocaleString('de-de')} EP]`, `${countSmallBooks} Grün | ${countMediumBooks} Blau | ${countLargeBooks} Lila`);
            d.addField('Erforderliches Mora', `${moraSum.toLocaleString('de-de')} Mora`);
            if (totalAscensionMora > 0) {
                d.addField(`Kosten für Aufstieg [${totalAscensionMora.toLocaleString('de-de')} Mora]`, ascensionString);
            }
            message.channel.send(d).then(async function (msg) {
                msg.channel.stopTyping();
            });
        } else {
            // error occured
            message.channel.send('Befehl für Level Up ist fehlgeschlagen.').then(async function (msg) {
                msg.channel.stopTyping();
            });
        }
    };

    getApiService().levelupFigure(callback, start, end);
}

function sendWeaponLevelupExpMessage (message, start, end) {
    const callback = function (expList, levelupEntries, moraList, error) {
        const fiveExp = expList[0].five_exp;
        const fourExp = expList[0].four_exp;
        if (error == null) {
            const d = new Discord.MessageEmbed();
            d.setThumbnail(LOGO_URL);
            d.setTitle(`Übersicht Kosten beim Leveln der Waffe: ${start} - ${end}`);
            d.setFooter(YUANSHEN_TITLE);

            // 400 exp = 40 Mora: Grau
            // 2000 exp = 200 Mora: Gruen
            // 10 000 exp = 1000 Mora: Blau

            let moraSum = 0;
            let calculateExp = fourExp;

            let countLargeChunk = parseInt(calculateExp / 10000.0);
            calculateExp = calculateExp - countLargeChunk * 10000;
            let countMediumChunk = parseInt(calculateExp / 2000.0);
            calculateExp = calculateExp - countMediumChunk * 2000;
            let countSmallChunk = parseInt(calculateExp / 400.0);
            calculateExp = calculateExp - countSmallChunk * 400;

            if (calculateExp > 0) {
                // add small chunk for covering exp below 1000
                countSmallChunk = countSmallChunk + 1;
            }
            moraSum = countLargeChunk * 1000 + countMediumChunk * 200 + countSmallChunk * 40;

            d.addField(`Erfahrungspunkte bei 4-Sterne Waffe [${fourExp.toLocaleString('de-de')} EP]`, `${countSmallChunk} Grau | ${countMediumChunk} Grün | ${countLargeChunk} Blau`);
            d.addField('Mora bei 4-Sterne Waffe', `${moraSum.toLocaleString('de-de')} Mora`);

            // five star weapon
            moraSum = 0;
            calculateExp = fiveExp;

            countLargeChunk = parseInt(calculateExp / 10000.0);
            calculateExp = calculateExp - countLargeChunk * 10000;
            countMediumChunk = parseInt(calculateExp / 2000.0);
            calculateExp = calculateExp - countMediumChunk * 2000;
            countSmallChunk = parseInt(calculateExp / 400.0);
            calculateExp = calculateExp - countSmallChunk * 400;

            if (calculateExp > 0) {
                // add small chunk for covering exp below 1000
                countSmallChunk = countSmallChunk + 1;
            }
            moraSum = countLargeChunk * 1000 + countMediumChunk * 200 + countSmallChunk * 40;
            d.addField(`Erfahrungspunkte bei 5-Sterne Waffe [${fiveExp.toLocaleString('de-de')} EP]`, `${countSmallChunk} Grau | ${countMediumChunk} Grün | ${countLargeChunk} Blau`);
            d.addField('Mora bei 5-Sterne Waffe', `${moraSum.toLocaleString('de-de')} Mora`);

            message.channel.send(d).then(async function (msg) {
                msg.channel.stopTyping();
            });
        } else {
            // error occured
            message.channel.send('Befehl für Level Up ist fehlgeschlagen.').then(async function (msg) {
                msg.channel.stopTyping();
            });
        }
    };

    getApiService().levelupWeapon(callback, start, end);
}
function sendTalentLevelupMessage (message, start, end) {
    // invalid input
    if (start < 1 || end > 10 || start >= end) {
        // error occured
        message.channel.send('Befehl für Talent Level Up ist fehlgeschlagen.');
        return;
    }

    const callback = function (talentList, error) {
        if (error == null) {
            const d = new Discord.MessageEmbed();
            d.setThumbnail(LOGO_URL);
            d.setTitle(`Übersicht Kosten beim Leveln der Talenten: ${start} auf ${end}`);
            d.setFooter(YUANSHEN_TITLE);

            let moraSum = 0;
            let book1Sum = 0;
            let book2Sum = 0;
            let book3Sum = 0;

            for (const t in talentList) {
                const talent = talentList[t];

                let color = '';

                switch (talent.book_rarity) {
                case 1: color = 'Grün'; book1Sum = book1Sum + talent.count_books; break;
                case 2: color = 'Blau'; book2Sum = book2Sum + talent.count_books; break;
                case 3: color = 'Lila'; book3Sum = book3Sum + talent.count_books; break;
                default: color = '';
                }

                moraSum = moraSum + talent.mora;
                // d.addField(`Talent auf ${talent.target_level}: ${talent.mora.toLocaleString('de-de')} Mora`, `${talent.count_books} Talentbücher [${color}]`);
            }
            d.addField('Insgesamt in Mora', `${moraSum.toLocaleString('de-de')} Mora`);
            d.addField('Anzahl der Bücher', `${book1Sum} Grün | ${book2Sum} Blau | ${book3Sum} Lila`);

            message.channel.send(d).then(async function (msg) {
                msg.channel.stopTyping();
            });
        } else {
            // error occured
            message.channel.send('Befehl für Level Up ist fehlgeschlagen.').then(async function (msg) {
                msg.channel.stopTyping();
            });
        }
    };
    getApiService().levelupTalent(callback, start, end);
}

function sendElementMessages (message, msgArguments, elementList) {
    const playerPick = [];

    const userData = message.mentions.users;

    for (let i = 0; i < msgArguments.length - 1; i++) {
        const element = elementList[i];
        let player = msgArguments[i + 1];
        const pick = {};

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
        const pick = playerPick.shift();

        // player
        const player = pick.player;

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
    let stars = '';

    for (let i = 0; i < number; i++) {
        const newLocal = '★';
        stars = stars + newLocal;
    }
    return stars;
};

function urlPrefix (ssl) {
    if (ssl) {
        return 'https://';
    } else {
        return 'http://';
    }
}

function apiServerUrl () {
    if (c.yuanshenServerPort === '' || c.yuanshenServerPort === undefined) {
        return urlPrefix(c.yuanshen_api_ssl) + c.yuanshenServer;
    } else {
        return urlPrefix(c.yuanshen_api_ssl) + c.yuanshenServer + ':' + c.yuanshenServerPort;
    }
}

// export
module.exports = {
    getHelpMessage: help,
    sendFigure: figureForMessage,
    sendReactionMessage: yuanshenReaction,
    sendFigureDraft: figureDraft,
    sendFigureTalent: figureTalent,
    sendFigurelist: figurelist,
    sendToday: sendToday,
    sendYesterday: sendYesterday,
    sendTomorrow: sendTomorrow,
    sendBoss: boss,
    sendBanner: banner,
    sendRandomDungeon: randomDungeon,
    sendRandomChallenge: randomChallenge,
    sendRandomLowChallenge: randomLowChallenge,
    sendRandomElement: randomElement,
    sendRandomWeapon: randomWeapon,
    sendRandom: random,
    sendArtifact: artifact,
    sendLevelup: levelup,
    sendFigMat: figurematerial
};
