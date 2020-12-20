// yuanshenService.js
// Service to get Services for Genshin Impact
// ================

const data = require('./yuanshen.json');

var db = require('./yuanshenDBHandler.js');
const figure = data.figure;

const figureData = (name, callback) => {
    // prevent null data
    if (name == null) {
        return null;
    }
    const sql = 'select * from Figure f ' +
    'left join (select eid, name as element from Element) e on f.element_id = e.eid ' +
    'left join (select wtid, name as weapon from Weapon_Type) wt on f.weapon_type_id = wt.wtid ' +
    'left join (select tid, name as talent from Talent) t on f.talent_id = t.tid ' +
    'left join (select lid, name as location from Location) l on f.location_id = l.lid ' +
    'left join (select bdid, name as boss_drop from Boss_Drop) bd on f.boss_drop_id = bd.bdid ' +
    'where name = ? collate nocase';

    db.executeQueryForSingleEntry(sql, [name], callback);
};

const figurelist = (callback) => {
    const resultCallback = function (entries) {
        var list = '';
        for (var i = 0; i < entries.length; i++) {
            const name = entries[i].name;
            var element = '';
            if (entries[i].element !== '') {
                element = ` [${getServersideString(entries[i].element)}]`;
            }
            list = `${list} ${name}${element}\n`;
        }
        callback(list);
    };

    const sql = 'select name, e.element from Figure f ' +
    'left join (select eid, name as element from Element) e on f.element_id = e.eid order by name asc';
    db.executeQuery(sql, [], resultCallback);
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
