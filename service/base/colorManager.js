// colorManager.js
// Color Manager for accessing unique color codes.
// ==================

/**
 * Color Manager for accessing unique color codes.
 */
class ColorManager {
    // init logger manager
    constructor () {
        ColorManager.instance = this;
    }

    // access singleton instance
    static getInstance () {
        if (!ColorManager.instance) {
            ColorManager.instance = new ColorManager();
        }
        return ColorManager.instance;
    }

    defaultColor () {
        return '#123456';
    }
};

module.exports = ColorManager;
