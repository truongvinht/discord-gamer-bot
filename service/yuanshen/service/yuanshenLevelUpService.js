// yuanshenLevelUpService.js
// Service to do level up calculation.
// ==================

/**
 * Figure level Up Object.
 */
class LevelUpFigure {
    constructor () {
        this.level01To20 = { exp: 120175, mora: 24000 };
        this.level20To40 = { exp: 578325, mora: 115600 };
        this.level40To50 = { exp: 579100, mora: 115800 };
        this.level50To60 = { exp: 854125, mora: 170800 };
        this.level60To70 = { exp: 1195925, mora: 239200 };
        this.level70To80 = { exp: 1611875, mora: 322200 };
        this.level80To90 = { exp: 3423125, mora: 684600 };

        this.ascension20 = { mora: 20000 };
        this.ascension40 = { mora: 40000 };
        this.ascension50 = { mora: 60000 };
        this.ascension60 = { mora: 80000 };
        this.ascension70 = { mora: 100000 };
        this.ascension80 = { mora: 120000 };
    }

    calculateLevel (from, to) {
        // bad input
        if (from < 1 || to > 90) {
            return undefined;
        }
        // bad input for comparison
        if (from > to) {
            return null;
        }
        const totalExp = 0;
        const totalMora = 0;

        if (from === to) {
            return { totalExp: totalExp, totalMora: totalMora };
        }

        return {};
    }
};

/**
 * Figure level Up Object.
 */
class LevelUpTalent {
    constructor () {
        this.levelTo2 = { count: 3, color: 'green', mora: 12500 };
        this.levelTo3 = { count: 2, color: 'blue', mora: 17500 };
        this.levelTo4 = { count: 4, color: 'blue', mora: 25000 };
        this.levelTo5 = { count: 6, color: 'blue', mora: 30000 };
        this.levelTo6 = { count: 9, color: 'blue', mora: 37500 };
        this.levelTo7 = { count: 4, color: 'purple', mora: 120000 };
        this.levelTo8 = { count: 6, color: 'purple', mora: 260000 };
        this.levelTo9 = { count: 12, color: 'purple', mora: 450000 };
    }

    calculateLevel (from, to) {
        // bad input
        if (from < 1 || to > 90) {
            return undefined;
        }
        return {};
    }
};

/**
 * Service to do level up calculation.
 */
class LevelUpService {
    /**
     * Constructor for initializing api url and token
     * @constructor
     * @param {number} type - 1: Figure, 2: Weapon, 3: Talent
     */
    constructor (type) {
        // invalid type
        if (type === undefined || type == null) {
            throw new TypeError("Invalid input for 'type'");
        }
        this.type = type;
    }

    /**
     * Calculate how much Mora is required to reach level 90
     * @param {requestCallback} callback callback to handle result and error
     * @param {number} current current unit level
     */
    calculateMoraToLevel90 (callback, current) {

    }
};
module.exports = LevelUpService;
