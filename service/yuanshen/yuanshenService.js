// yuanshenService.js
// Service to get Services for Genshin Impact
// ================

const data = require('./yuanshen.json');

var sqlite3 = require('sqlite3').verbose();
const DBSOURCE = './service/yuanshen/data/yuanshen.sqlite';

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

    executeQueryForSingleEntry(sql, [name], callback);
};

const figurelist = (callback) => {
    const sql = 'select name, e.element, f.talent_id from Figure f ' +
    'left join (select eid, name as element from Element) e on f.element_id = e.eid order by name asc';
    executeQuery(sql, [], callback);
};

const talentForWeekday = (weekday, callback) => {
    const sql = 'select * from Talent_Drop d ' +
    'left join (select tid,lid,name,location from Talent t ' +
    'left join (select lid, name as location from Location) l on t.location_id = l.lid ) tl ' +
    'on d.talent_id = tl.tid ' +
    'left join (SELECT wid, position,  name as weekday, short_name as weekday_short from Weekday) wd ' +
    'on d.weekday_id = wd.wid ' +
    'where position = ?';
    executeQuery(sql, [weekday], callback);
};

const weaponMaterialForWeekday = (weekday, callback) => {
    const sql = 'select * from Weapon_Material_Drop d ' +
    'left join (select wmid,location_id,name from Weapon_Material) wm ' +
    'on d.weapon_material_id = wmid ' +
    'left join (select wid, position, name as weekday, short_name as weekday_short from Weekday) w ' +
    'on w.wid = d.weekday_id where position = ?';
    executeQuery(sql, [weekday], callback);
};

const regions = (callback) => {
    const sql = 'select * from Location';
    executeQuery(sql, [], callback);
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

const today = (callback) => {
    const d = new Date();
    var weekday = d.getDay(); // 0-6 Sonntag - Samstag

    // override Sunday as 7
    if (weekday === 0) {
        weekday = 7;
    }

    // get all regions
    const regioncallback = function (regions, rcount) {
        // get all talents for current weekday
        const talentcallback = function (talents, tcount) {
            const figurecallback = function (figures, tcount) {
                const weaponcallback = function (weapons, wpcount) {
                    callback(regions, figures, talents, weapons);
                };
                weaponMaterialForWeekday(weekday, weaponcallback);
            };
            figurelist(figurecallback);
        };

        talentForWeekday(weekday, talentcallback);
    };
    regions(regioncallback);

    // var resultMap = { talent: {}, weapon: {}, birthday: [] };

    // // weekday
    // const d = new Date();
    // var weekday = d.getDay(); // 0-6 Sonntag - Samstag

    // // override Sunday as 7
    // if (weekday === 0) {
    //     weekday = 7;
    // }

    // // collect all farmable talent books for today
    // const talentbooks = data.talentbooks;
    // const talentkeys = Object.keys(talentbooks);

    // for (var i = 0; i < talentkeys.length; i++) {
    //     const talentDetail = talentbooks[talentkeys[i]];
    //     const bookweekdates = talentDetail.weekday;

    //     for (var j = 0; j < bookweekdates.length; j++) {
    //         if (bookweekdates[j] === weekday) {
    //             // find all figures with same talent
    //             const figureList = findFigureByTalent(talentDetail.name);
    //             resultMap.talent[talentkeys[i]] = { name: talentDetail.name, location: talentDetail.location, figures: figureList };
    //         }
    //     }
    // }

    // // weapons
    // const weaponmats = data.weapondrops;
    // const weaponkeys = Object.keys(weaponmats);

    // for (var a = 0; a < weaponkeys.length; a++) {
    //     const weaponDetail = weaponmats[weaponkeys[a]];
    //     const weapondates = weaponDetail.weekday;

    //     for (var b = 0; b < weapondates.length; b++) {
    //         if (weapondates[b] === weekday) {
    //             resultMap.weapon[weaponkeys[a]] = { name: weaponDetail.name, location: weaponDetail.location };
    //         }
    //     }
    // }

    // // get birthday
    // return resultMap;
};

const db = new sqlite3.Database(DBSOURCE, (err) => {
    if (err) {
        // Cannot open database
        console.error(err.message);
        throw err;
    } else {
        console.log('Connecting to the SQLite database...');
        db.run('SELECT *  FROM Figure',
            (err) => {
                if (err) {
                // Table missing
                    console.log('Cant access SQLite database');
                }
            });
    }
});

// wrapper for access sqlite
const executeQuery = (sql, params, callback) => {
    db.all(sql, params, (err, rows) => {
        if (err) {
            console.log(`Query: ${sql}`);
            console.log(err.message);
            return;
        }
        callback(rows);
    });
};

const executeQueryForSingleEntry = (sql, params, callback) => {
    const singleCallback = function (entry) {
        if (entry == null) {
            callback(null);
        } else {
            if (entry.length > 0) {
                // console.log(entry[0]);
                callback(entry[0]);
            }
        }
    };
    executeQuery(sql, params, singleCallback);
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
