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
        list = `${list} ${name}\n`;
    }
    return list;
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

const today = () => {
    var resultMap = { talent: {}, weapon: {}, birthday: [] };

    // weekday
    const d = new Date();
    var weekday = d.getDay(); // 0-6 Sonntag - Samstag

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

    // collect all farmable talent books for today

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
    getToday: today
};
