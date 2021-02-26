// yuanshenDraftHandler.js
// handle draft data
// ==================

// available figures
var figures = [];

// reset list for figures
const resetFigures = (inputFigures) => {
    figures = inputFigures;
};

// get a batch of names based on size
const draftFigure = (size) => {
    var draft = [];

    for (var i = 0; i < size && figures.length >= size; i++) {
        var pickedIndex = Math.floor(Math.random() * Math.floor(figures.length));

        // prevent duplicated entry
        while (draft.includes(figures[pickedIndex])) {
            pickedIndex = Math.floor(Math.random() * Math.floor(figures.length));
        }
        draft.push(figures[pickedIndex]);
    }

    return draft;
};

// remove entries
const dropFigures = (dropped) => {
    for (var i = 0; i < dropped.length; i++) {
        figures.filter(v => v !== dropped[i]);
    }

    return figures;
};

// export
module.exports = {
    getFigures: figures,
    getDraftBatch: draftFigure,
    dropFigures: dropFigures,
    resetFigures: resetFigures
};
