// yuanshenService.js
// Service to get Services for Genshin Impact
// ================

// import
const https = require('https');
const c = require('../../helper/envHandler');

const YUANSHEN_API_URL = 'yuanshen-api.herokuapp.com';

function getRequestApi (callback, path, param) {
    // token for api access
    const TOKEN = c.yuanshenToken;

    let header = {};

    if (param == null) {
        header = { authorization: TOKEN };
    } else {
        header = param;
        header.authorization = TOKEN;
    }

    const options = {
        host: YUANSHEN_API_URL,
        path: path,
        method: 'GET',
        headers: header
    };

    https.get(options, res => {
        const data = [];

        res.on('data', chunk => {
            data.push(chunk);
        });

        res.on('end', () => {
            const content = Buffer.concat(data).toString();
            const responseData = JSON.parse(content);
            callback(responseData, null);
        });
    }).on('error', err => {
        console.log('Error: ', err.message);
        callback(null, err);
    });
}

// GET all figures
const allFigures = (callback) => {
    getRequestApi(callback, '/api/v1/figures', null);
};

// GET figure by name
const singleFigure = (callback, name) => {
    getRequestApi(callback, '/api/v1/figure', { 'name': name });
};

// GET all locations
const allLocations = (callback) => {
    getRequestApi(callback, '/api/v1/location', null);
};

// GET talents for weekday
const allTalentsForWeekday = (callback, weekday) => {
    getRequestApi(callback, '/api/v1/talents', { 'weekday': weekday });
};

// GET weekdays for talent id
const allWeekdaysForTalent = (callback, talentId) => {
    getRequestApi(callback, '/api/v1/talents', { 'talent_id': talentId });
};

// GET weekdays for talent id
const allTalents = (callback) => {
    getRequestApi(callback, '/api/v1/talents', null);
};

// GET talent scheduler
const allTalentSchedules = (callback) => {
    getRequestApi(callback, '/api/v1/talentSchedule', null);
};

// GET weapon material for weekday
const allWeaponMaterialForWeekday = (callback, weekday) => {
    getRequestApi(callback, '/api/v1/weapon_material_drop', {'weekday': weekday});
};

// GET all elements
const allElements = (callback) => {
    getRequestApi(callback, '/api/v1/elements', null);
};

// GET all weapon types
const allWeapontypes = (callback) => {
    getRequestApi(callback, '/api/v1/weapon_type', null);
};

// GET all dungeons
const allDungeons = (callback) => {
    getRequestApi(callback, '/api/v1/dungeons', null);
};

// GET all artifacts
const allArtifacts = (callback) => {
    getRequestApi(callback, '/api/v1/artifact', null);
};

// GET all bosses
const allBosses = (callback) => {
    getRequestApi(callback, '/api/v1/boss', null);
};

// GET all boss drops
const allBossDrops = (callback) => {
    getRequestApi(callback, '/api/v1/bossdrops', null);
};

// GET all figures with boss drops
const allFiguresWithBossDrops = (callback) => {
    getRequestApi(callback, '/api/v1/figuresWithBossDrops', null);
};

// GET all banner
const allBanner = (callback) => {
    getRequestApi(callback, '/api/v1/banner', null);
};

const rating = (number) => {
    var stars = '';

    for (var i = 0; i < number; i++) {
        const newLocal = '★';
        stars = stars + newLocal;
    }
    return stars;
};

const randomElement = (count, callback) => {
    const elementcallback = function (elements, err_el) {
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
    allElements(elementcallback);
};

const randomWeapon = (count, callback) => {
    const weaponCallback = function (weapons, _) {
        var pickedList = [];

        for (var i = 0; i < count; i++) {
            var pickedIndex = Math.floor(Math.random() * Math.floor(weapons.length));
            pickedList.push(weapons[pickedIndex]);
        }
        callback(pickedList);
    };
    allWeapontypes(weaponCallback);
};

const randomDungeon = (callback) => {
    const dungeonCallback = function (dungeons, err_dng) {
        const pickedIndex = Math.floor(Math.random() * Math.floor(dungeons.length));
        callback(dungeons[pickedIndex]);
    };
    allDungeons(dungeonCallback);
};

const today = (callback) => {
    const d = new Date();
    var weekday = d.getDay(); // 0-6 Sonntag - Samstag

    // override Sunday as 7
    if (weekday === 0) {
        weekday = 7;
    }

    selectedDay(weekday, callback);
};

const selectedDay = (weekday, callback) => {
    const regioncallback = function (regions, err_reg) {
        const talentcallback = function (talents, err_tal) {
            const figurecallback = function (figures, err_fig) {
                const weaponcallback = function (weapons, err_weap) {
                    callback(regions, figures, talents, weapons);
                };
                allWeaponMaterialForWeekday(weaponcallback, weekday);
            };
            allFigures(figurecallback);
        };
        allTalentsForWeekday(talentcallback, weekday);
    };
    allLocations(regioncallback);
};

const boss = (callback) => {
    // get all boss
    const bosscallback = function (bosslist, _) {
        const bossdropscallback = function (bossdroplist, _) {
            const figurbossdropcallback = function (figuredroplist, _) {
                callback(bosslist, bossdroplist, figuredroplist);
            };
            allFiguresWithBossDrops(figurbossdropcallback);
        };
        allBossDrops(bossdropscallback);
    };
    allBosses(bosscallback);
};

const talent = (callback) => {
    const talentCallback = function (talents, err_talent) {
        const figurecallback = function (figures, err_fig) {
            const weekdayCallback = function (weekdays, err_sched) {
                callback(talents, figures, weekdays);
            };
            allTalentSchedules(weekdayCallback);
        };
        allFigures(figurecallback);
    };
    allTalents(talentCallback);
};

const banner = (callback) => {
    // get all boss
    const bannerCallback = function (bannerList, _) {
        callback(bannerList);
    };
    allBanner(bannerCallback);
};

const artifact = (callback) => {
    const afcallback = function (list, _) {
        callback(list);
    };
    allArtifacts(afcallback);
};

// export
module.exports = {
    allFigures,
    singleFigure,
    allWeekdaysForTalent,
    allTalents,
    allElements,
    allWeapontypes,
    allDungeons,
    getStarrating: rating,
    getRandomElement: randomElement,
    getRandomWeapon: randomWeapon,
    getRandomDungeon: randomDungeon,
    getToday: today,
    getSelectedDay: selectedDay,
    getBoss: boss,
    getTalent: talent,
    getBanner: banner,
    getArtifactset: artifact
};
