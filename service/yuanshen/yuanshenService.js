// yuanshenService.js
// Service to get Services for Genshin Impact
// ================

const data = require('./yuanshen.json');
const figure = data.figure;

const figureData = (name) => {
    // prevent null data
    if (name == null) {
        return null;
    }

    if (name.toLowerCase() === 'childe') {
        return figure.tartaglia;
    }

    if (name.toLowerCase() === 'sucrose') {
        return figure.saccharose;
    }

    if (Object.prototype.hasOwnProperty.call(figure, name.toLowerCase())) {
        return figure[name.toLowerCase()];
    } else {
        return null;
    }
};

const figurelist = () => {
    var list = '';
    for (var i = 0; i < Object.keys(figure).length; i++) {
        const figurelist = Object.keys(figure);
        const key = figurelist[i];
        const name = figure[key].name;

        var element = '';

        if (figure[key].element !== '') {
            element = ` [${getServersideString(figure[key].element)}]`;
        }

        list = `${list} ${name}${element}\n`;
    }
    return list;
};

const getServersideString = (element) => {
    // if (element === 'Elektro') {
    //     return ':VisionElectro:';
    // }

    // return ` :Vision${element}: `;
    return element;
};

const figurecount = () => {
    return Object.keys(figure).length;
};

const rating = (number) => {
    var stars = '';

    for (var i = 0; i < number; i++) {
        stars = stars + '★';
    }
    return stars;
};

const element = (icons) => {
    if (Object.prototype.hasOwnProperty.call(data.icons, icons)) {
        return data.icons[icons];
    } else {
        return null;
    }
};

const randomElement = (count) => {
    const element = data.element;

    var pickedList = [];

    for (var i = 0; i < count; i++) {
        var pickedIndex = Math.floor(Math.random() * Math.floor(element.length));

        // prevent Dendro! doesnt exist yet
        while (pickedIndex === 2) {
            pickedIndex = Math.floor(Math.random() * Math.floor(element.length));
        }

        pickedList.push(element[pickedIndex]);
    }
    return pickedList;
};

const randomWeapon = (count) => {
    const element = data.weapons;

    var pickedList = [];

    for (var i = 0; i < count; i++) {
        var pickedIndex = Math.floor(Math.random() * Math.floor(element.length));

        // prevent Dendro! doesnt exist yet
        while (pickedIndex === 2) {
            pickedIndex = Math.floor(Math.random() * Math.floor(element.length));
        }

        pickedList.push(element[pickedIndex]);
    }
    return pickedList;
};

const findFigureByTalent = (talent) => {
    var figures = [];

    for (var i = 0; i < Object.keys(figure).length; i++) {
        const fig = Object.keys(figure);
        const key = fig[i];

        if (talent === figure[key].talent) {
            const name = figure[key].name;
            figures.push(name);
        }
    }

    return figures;
};

const findWeeklyBossByDrop = (drop) => {
    const weeklybossList = data.weeklyboss;

    for (var i = 0; i < Object.keys(weeklybossList).length; i++) {
        const keyLists = Object.keys(weeklybossList);
        const key = keyLists[i];

        const bossDrops = weeklybossList[key].drops;

        for (var j = 0; j < bossDrops.length; j++) {
            if (drop === bossDrops[j]) {
                return `${weeklybossList[key].name} [${weeklybossList[key].description}]`;
            }
        }
    }

    // not found
    return 'Unbekannt';
};

const findDayByTalentbook = (book) => {
    // collect all farmable talent books for today
    const talentbooks = data.talentbooks;
    const talentkeys = Object.keys(talentbooks);

    for (var i = 0; i < talentkeys.length; i++) {

        const talentDetail = talentbooks[talentkeys[i]];
        if (book === talentDetail.name) {
            var result = [];

            const datemap = { 1: 'Mo', 2: 'Di', 3: 'Mi', 4: 'Do', 5: 'Fr', 6: 'Sa', 0: 'So' };
            for (var j = 0; j < talentDetail.weekday.length; j++) {
                result.push(datemap[`${talentDetail.weekday[j]}`]);
            }

            return result;
        }
    }
    return '';
};

const today = () => {
    var resultMap = { talent: {}, weapon: {}, birthday: [] };

    // weekday
    const d = new Date();
    var weekday = d.getDay(); // 0-6 Sonntag - Samstag

    // collect all farmable talent books for today
    const talentbooks = data.talentbooks;
    const talentkeys = Object.keys(talentbooks);

    for (var i = 0; i < talentkeys.length; i++) {
        const talentDetail = talentbooks[talentkeys[i]];
        const bookweekdates = talentDetail.weekday;

        for (var j = 0; j < bookweekdates.length; j++) {
            if (bookweekdates[j] === weekday) {
                // find all figures with same talent
                const figureList = findFigureByTalent(talentDetail.name);
                resultMap.talent[talentkeys[i]] = { name: talentDetail.name, location: talentDetail.location, figures: figureList };
            }
        }
    }

    // weapons
    const weaponmats = data.weapondrops;
    const weaponkeys = Object.keys(weaponmats);

    for (var a = 0; a < weaponkeys.length; a++) {
        const weaponDetail = weaponmats[weaponkeys[a]];
        const weapondates = weaponDetail.weekday;

        for (var b = 0; b < weapondates.length; b++) {
            if (weapondates[b] === weekday) {
                resultMap.weapon[weaponkeys[a]] = { name: weaponDetail.name, location: weaponDetail.location };
            }
        }
    }

    // get birthday
    return resultMap;
};

// export
module.exports = {
    getFigure: figureData,
    getAllFigures: figurelist,
    getFiguresCount: figurecount,
    getStarrating: rating,
    getElementIconUrl: element,
    getRandomElement: randomElement,
    getRandomWeapon: randomWeapon,
    findWeeklyBoss: findWeeklyBossByDrop,
    findTalentWeekday: findDayByTalentbook,
    getToday: today
};
