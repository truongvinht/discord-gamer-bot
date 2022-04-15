// yuanshenService.js
// Service to access custom Yuan Shen API.
// ==================

// import
const YuanShenApiRestFulService = require('./yuanshenApiRestfulService');

/**
 * Service to acccess Yuanshen Data.
 * {@link yuanshenApiRestfulService}
 */
class YuanShenApiService extends YuanShenApiRestFulService {
    /**
     * GET a random dungeon
     * @param {requestCallback} callback callback to handle result/error
     */
    randomDungeon (callback) {
        const service = this;
        const dungeonCallback = function (data, err) {
            if (err == null) {
                const dungeons = data.data;
                const pickedIndex = Math.floor(Math.random() * Math.floor(dungeons.length));
                const dungeon = dungeons[pickedIndex];
                // request for location details
                const locationCallback = (locationData, locErr) => {
                    if (locErr == null) {
                        dungeon.location = locationData.data;
                    }
                    callback(dungeon, null);
                };
                service.locationForId(locationCallback, dungeon.location_id);
            } else {
                // forward error
                callback(null, err);
            }
        };
        super.allDungeons(dungeonCallback);
    }

    /**
     * GET all artifacts with location
     * @param {requestCallback} callback callback to handle result/error
     */
    allArtifactsWithLocation (callback) {
        const service = this;
        const artifactCallback = function (artifactData, artErr) {
            if (artErr == null) {
                const dungeonCallback = (dungeonData, dunErr) => {
                    const artifacts = artifactData.data;
                    if (dunErr == null) {
                        const dungeons = dungeonData.data;
                        for (const artifact of artifacts) {
                            for (const dungeon of dungeons) {
                                if (artifact.dungeon_id === dungeon._id) {
                                    artifact.dungeon = dungeon.name;
                                }
                            }
                        }
                    }
                    callback(artifacts, null);
                };
                service.allDungeons(dungeonCallback);
            } else {
                callback(null, artErr);
            }
        };
        super.allArtifacts(artifactCallback);
    }
};

module.exports = YuanShenApiService;
