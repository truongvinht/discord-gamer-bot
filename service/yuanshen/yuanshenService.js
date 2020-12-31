// yuanshenService.js
// Service to get Services for Genshin Impact
// ================

const data = require('./yuanshen.json');

var sqlite3 = require('sqlite3').verbose();
const DBSOURCE = './service/yuanshen/data/yuanshen.sqlite';

const figureData = (name, callback) => {
    // prevent null data
    if (name == null) {
        return null;
    }
    const sql = 'select * from Figure f ' +
    'left join (select eid, name as element, image_url as element_image_url from Element) e on f.element_id = e.eid ' +
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

const figurelistWithBossDrops = (callback) => {
    const sql = 'select name, bdid, boss_id from Figure f ' +
    'left join (select bdid, boss_id from Boss_Drop) bd on f.boss_drop_id = bd.bdid ' +
    'where f.boss_drop_id is not null order by name';
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

const bosslist = (callback) => {
    const sql = 'select * from Boss b ' +
    'left join (select lid, name as location from Location) l on b.location_id = l.lid';
    executeQuery(sql, [], callback);
};

const bossdroplist = (callback) => {
    const sql = 'select * from Boss_Drop order by boss_id';
    executeQuery(sql, [], callback);
};

const regions = (callback) => {
    const sql = 'select * from Location';
    executeQuery(sql, [], callback);
};

const elements = (callback) => {
    const sql = 'select * from Element';
    executeQuery(sql, [], callback);
};

const weapontype = (callback) => {
    const sql = 'select * from Weapon_Type';
    executeQuery(sql, [], callback);
};

const dungeons = (callback) => {
    const sql = 'select * from Dungeon d ' +
    'left join (select lid, name as location from Location) l on d.location_id = l.lid';
    executeQuery(sql, [], callback);
};

const rating = (number) => {
    var stars = '';

    for (var i = 0; i < number; i++) {
        stars = stars + '★';
    }
    return stars;
};

const randomElement = (count, callback) => {
    const elementcallback = function (elements, resultCount) {
        var pickedList = [];

        for (var i = 0; i < count; i++) {
            var pickedIndex = Math.floor(Math.random() * Math.floor(elements.length));
            // prevent Dendro! doesnt exist yet (eid = 3)
            while (elements[pickedIndex].eid === 3) {
                pickedIndex = Math.floor(Math.random() * Math.floor(elements.length));
            }
            pickedList.push(elements[pickedIndex]);
        }
        callback(pickedList);
    };
    elements(elementcallback);
};

const randomWeapon = (count, callback) => {
    const weaponCallback = function (weapons, resultCount) {
        var pickedList = [];

        for (var i = 0; i < count; i++) {
            var pickedIndex = Math.floor(Math.random() * Math.floor(weapons.length));
            pickedList.push(weapons[pickedIndex]);
        }
        callback(pickedList);
    };
    weapontype(weaponCallback);
};

const randomDungeon = (callback) => {
    const dungeonCallback = function (dungeons, resultcount) {
        const pickedIndex = Math.floor(Math.random() * Math.floor(dungeons.length));
        callback(dungeons[pickedIndex]);
    };
    dungeons(dungeonCallback);
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
};

const boss = (callback) => {
    // get all boss
    const bosscallback = function (bosslist, rcount) {
        const bossdropscallback = function (bossdroplist, bdcount) {
            const figurbossdropcallback = function (figuredroplist, rcount) {
                callback(bosslist, bossdroplist, figuredroplist);
            };
            figurelistWithBossDrops(figurbossdropcallback);
        };
        bossdroplist(bossdropscallback);
    };
    bosslist(bosscallback);
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
    getStarrating: rating,
    getRandomElement: randomElement,
    getRandomWeapon: randomWeapon,
    getRandomDungeon: randomDungeon,
    findWeeklyBoss: findWeeklyBossByDrop,
    findTalentWeekday: findDayByTalentbook,
    getToday: today,
    getBoss: boss
};
