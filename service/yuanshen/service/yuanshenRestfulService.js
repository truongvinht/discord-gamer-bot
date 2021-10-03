// yuanshenApiService.js
// Service to access custom Yuan Shen Restful API Services.
// ==================

// import
const ApiAccessService = require('./apiAccessService');

/**
 * Service to acccess Restful API for Yuanshen.
 * {@link ApiAccessService}
 */
class YuanShenRestFulService extends ApiAccessService {
    /**
     * GET all Figures
     * @param {requestCallback} callback callback to handle result/error
     */
    allFigures (callback) {
        super.getRequest(callback, '/api/v1/figures', null);
    }

    /**
     * GET a Figure by name
     * @param {requestCallback} callback callback to handle result/error
     * @param {string} name figure name
     */
    singleFigure (callback, name) {
        super.getRequest(callback, '/api/v1/figure', { name: name });
    }

    /**
     * GET a Figure details by name
     * @param {requestCallback} callback callback to handle result/error
     * @param {string} name figure name
     */
    singleFigureDetails (callback, name) {
        super.getRequest(callback, '/api/v1/figureDetails', { name: name });
    }

    /**
     * GET all locations
     * @param {requestCallback} callback callback to handle result/error
     */
    allLocations (callback) {
        super.getRequest(callback, '/api/v1/locations', null);
    }

    /**
     * GET a talents for a weekday
     * @param {requestCallback} callback callback to handle result/error
     * @param {number} weekday weekday index
     */
    allTalentsForWeekday (callback, weekday) {
        super.getRequest(callback, '/api/v1/talents', { weekday: weekday });
    }

    /**
     * GET weekdays for talent id
     * @param {requestCallback} callback callback to handle result/error
     * @param {number} talentId talent ID
     */
    allWeekdaysForTalent (callback, talentId) {
        super.getRequest(callback, '/api/v1/talents', { talent_id: talentId });
    }

    /**
     * GET all talents
     * @param {requestCallback} callback callback to handle result/error
     */
    allTalents (callback) {
        super.getRequest(callback, '/api/v1/talents', null);
    }

    /**
     * GET all talents scheduler
     * @param {requestCallback} callback callback to handle result/error
     */
    allTalentSchedules (callback) {
        super.getRequest(callback, '/api/v1/talentSchedule', null);
    }

    /**
     * GET all weapon material for a weekday
     * @param {requestCallback} callback callback to handle result/error
     * @param {number} weekday weekday index
     */
    allWeaponMaterialForWeekday (callback, weekday) {
        super.getRequest(callback, '/api/v1/weapon_material_drop', { weekday: weekday });
    };

    /**
     * GET all elements
     * @param {requestCallback} callback callback to handle result/error
     */
    allElements (callback) {
        super.getRequest(callback, '/api/v1/elements', null);
    }

    /**
     * GET all weapon types
     * @param {requestCallback} callback callback to handle result/error
     */
    allWeapontypes (callback) {
        super.getRequest(callback, '/api/v1/weapon_type', null);
    }

    /**
     * GET all dungeons
     * @param {requestCallback} callback callback to handle result/error
     */
    allDungeons (callback) {
        super.getRequest(callback, '/api/v1/dungeons', null);
    }

    /**
     * GET all artifacts
     * @param {requestCallback} callback callback to handle result/error
     */
    allArtifacts (callback) {
        super.getRequest(callback, '/api/v1/artifact', null);
    }

    /**
     * GET all bosses
     * @param {requestCallback} callback callback to handle result/error
     */
    allBosses (callback) {
        super.getRequest(callback, '/api/v1/boss', null);
    }

    /**
     * GET all normal bosses
     * @param {requestCallback} callback callback to handle result/error
     */
    allNormalBoss (callback) {
        super.getRequest(callback, '/api/v1/normalboss', null);
    }

    /**
     * GET all boss drops
     * @param {requestCallback} callback callback to handle result/error
     */
    allBossDrops (callback) {
        super.getRequest(callback, '/api/v1/bossdrops', null);
    }

    /**
     * GET all figures with boss drops
     * @param {requestCallback} callback callback to handle result/error
     */
    allFiguresWithBossDrops (callback) {
        super.getRequest(callback, '/api/v1/figuresWithBossDrops', null);
    }

    /**
     * GET all wish banner
     * @param {requestCallback} callback callback to handle result/error
     */
    allBanners (callback) {
        super.getRequest(callback, '/api/v1/banner', null);
    }

    /**
     * GET wish banner for a time
     * @param {requestCallback} callback callback to handle result/error
     * @param {number} time date in YYYYMMDD
     */
    targetBannerInTime (callback, time) {
        super.getRequest(callback, '/api/v1/banner', { time: time });
    }

    /**
     * GET wish banner with matching id
     * @param {requestCallback} callback callback to handle result/error
     * @param {number} gbid banner id
     */
    targetBanner (callback, gbid) {
        super.getRequest(callback, `/api/v1/banner/${gbid}`, null);
    }

    /**
     * GET all wish banner for figure appearance
     * @param {requestCallback} callback callback to handle result/error
     * @param {number} fid figure ID
     */
    allBannerForSelectedFigure (callback, fid) {
        super.getRequest(callback, '/api/v1/banner', { fid: fid });
    }

    /**
     * GET all figures for selected banner
     * @param {requestCallback} callback callback to handle result/error
     * @param {number} gbid gatcha banner ID
     */
    allFiguresForSelectedBanner (callback, gbid) {
        super.getRequest(callback, `/api/v1/banner/${gbid}/figures`, null);
    }

    /**
     * GET all wish banner with all figure details
     * @param {requestCallback} callback callback to handle result/error
     */
    allBannerWithFiguresDetails (callback) {
        super.getRequest(callback, '/api/v1/banners', null);
    }

    /**
     * GET all figure level up entries for given input
     * @param {requestCallback} callback callback to handle result/error
     * @param {number} start start level
     * @param {number} end end/target level
     */
    allLevelupFigureEntries (callback, start, end) {
        super.getRequest(callback, '/api/v1/levelup_figures', { start: start, end: end });
    }

    /**
     * GET total required exp for figure level up
     * @param {requestCallback} callback callback to handle result/error
     * @param {number} start start level
     * @param {number} end end/target level
     */
    levelupFigureExp (callback, start, end) {
        super.getRequest(callback, '/api/v1/levelup_figure_exp_required', { start: start, end: end });
    }

    /**
     * GET required mora for figure level up
     * @param {requestCallback} callback callback to handle result/error
     */
    allLevelupFigureMora (callback) {
        super.getRequest(callback, '/api/v1/levelup_figure_mora', null);
    }

    /**
     * GET all weapon level up entries for given input
     * @param {requestCallback} callback callback to handle result/error
     * @param {number} start start level
     * @param {number} end end/target level
     */
    allLevelupWeaponEntries (callback, start, end) {
        super.getRequest(callback, '/api/v1/levelup_weapons', { start: start, end: end });
    }

    /**
     * GET total required exp for weapon level up
     * @param {requestCallback} callback callback to handle result/error
     * @param {number} start start level
     * @param {number} end end/target level
     */
    levelupWeaponExp (callback, start, end) {
        super.getRequest(callback, '/api/v1/levelup_weapon_exp_required', { start: start, end: end });
    }

    /**
     * GET required mora for weapon level up
     * @param {requestCallback} callback callback to handle result/error
     */
    allLevelupWeaponMora (callback) {
        super.getRequest(callback, '/api/v1/levelup_weapon_mora', null);
    }

    /**
     * GET required information for talent level up
     * @param {requestCallback} callback callback to handle result/error
     * @param {number} start start level
     * @param {number} end end/target level
     */
    levelupTalent (callback, start, end) {
        super.getRequest(callback, '/api/v1/levelup_talent', { start: start, end: end });
    }
};

module.exports = YuanShenRestFulService;
