// autochessService.js
// Service to get Services for Autochess
// ================

const synergy = require('./synergy.json');
const raceList = synergy.race;
const classList = synergy.class;
const urlList = synergy.icons;

// race randomizer
const randomizerRace = (count) => {
    return getRandomSynergyFrom(raceList, count);
};

// class randomizer
const randomizerClass = (count) => {
    return getRandomSynergyFrom(classList, count);
};

function getRandomSynergyFrom (source, count) {
    const pickedList = [];

    for (let i = 0; i < count; i++) {
        let pickedIndex = Math.floor(Math.random() * Math.floor(source.length));

        // prevent same entries, if enough varity exist
        while (pickedList.includes(source[pickedIndex]) && source.length > pickedList.length) {
            pickedIndex = Math.floor(Math.random() * Math.floor(source.length));
        }

        pickedList.push(source[pickedIndex]);
    }
    return pickedList;
};

const randomSynergy = (count) => {
    let synergyList;

    if (Math.random() >= 0.5) {
        synergyList = classList;
    } else {
        synergyList = raceList;
    }

    return getRandomSynergyFrom(synergyList, count);
};

const iconUrl = (name) => {
    return urlList[name];
};

// export
module.exports = {
    getRandomRace: randomizerRace,
    getRandomClass: randomizerClass,
    getRandomSynergy: randomSynergy,
    getIconUrl: iconUrl
};
