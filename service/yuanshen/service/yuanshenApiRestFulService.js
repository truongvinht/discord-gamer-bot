// yuanshenApiService.js
// Service to access custom Yuan Shen Restful API Services.
// ==================

// import
const ApiAccessService = require('./apiAccessService');

/**
 * Service to acccess Restful API for Yuanshen.
 * {@link ApiAccessService}
 */
class YuanShenApiRestFulService extends ApiAccessService {
    /**
     * GET all locations
     * @param {requestCallback} callback callback to handle result/error
     */
    allLocations (callback) {
        super.getRequest(callback, '/api/locations', null);
    }

    /**
     * GET a Location by id
     * @param {requestCallback} callback callback to handle result/error
     * @param {string} id location id
     */
    locationForId (callback, id) {
        super.getRequest(callback, '/api/locations/' + id, null);
    }

    /**
     * GET all dungeons
     * @param {requestCallback} callback callback to handle result/error
     */
    allDungeons (callback) {
        super.getRequest(callback, '/api/dungeons', null);
    }

    /**
     * GET all artifacts
     * @param {requestCallback} callback callback to handle result/error
     */
    allArtifacts (callback) {
        super.getRequest(callback, '/api/artifacts', null);
    }
};

module.exports = YuanShenApiRestFulService;
