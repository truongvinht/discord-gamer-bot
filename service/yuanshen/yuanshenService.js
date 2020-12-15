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

// export
module.exports = {
    getFigure: figureData,
    getAllFigures: figurelist,
    getFiguresCount: figurecount,
    getStarrating: rating,
    getElementIconUrl: element,
    getRandomElement: randomElement,
    getRandomWeapon: randomWeapon
};
