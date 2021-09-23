// yuanshenService.js
// Service to access custom Yuan Shen API.
// ==================

// import
const ApiAccessService = require('./yuanshenRestfulService');

/**
 * Service to acccess Yuanshen Data.
 * {@link YuanShenRestFulService}
 */
class YuanShenService extends ApiAccessService {
    /**
     * GET a Figure by name
     * @param {requestCallback} callback callback to handle result/error
     * @param {string} name figure name
     */
    singleFigure (callback, name) {
        // check input and adjust
        const figureName = this.mapFigureNickname(name);
        super.singleFigure(callback, figureName);
    }

    /**
     * GET a Figure details by name
     * @param {requestCallback} callback callback to handle result/error
     * @param {string} name figure name
     */
    singleFigureDetails (callback, name) {
        // check input and adjust
        const figureName = this.mapFigureNickname(name);
        super.singleFigureDetails(callback, figureName);
    }

    /**
     * Map nickname to correct name
     * @param {string} name input name for checking
     * @returns matching or original name
     */
    mapFigureNickname (name) {
        const nickNameMap = { childe: 'tartaglia', sucrose: 'saccharose', hutao: 'hu tao', kazuha: 'kaedehara kazuha', ayaka: 'kamisato ayaka', baal: 'raiden shogun', sara: 'kujou sara', kokomi: 'sangonomiya kokomi' };

        if (Object.prototype.hasOwnProperty.call(nickNameMap, name.toLowerCase())) {
            return nickNameMap[name];
        }

        return name;
    }

    /**
     * Check whether combined name is valid
     * @param {string} name input name for checking
     * @returns true, if name is valid
     */
    validateLongFigureName (name) {
        const playerNames = ['hu tao', 'kaedehara kazuha', 'kamisato ayaka', 'raiden shogun', 'kujou sara', 'sangonomiya kokomi'];

        return playerNames.includes(name.toLowerCase());
    }

    /**
     * GET a list of random elements
     * @param {requestCallback} callback callback to handle result/error
     * @param {number} count number of random elements
     */
    randomElement (callback, count) {
        const elementcallback = function (elements, err) {
            if (err == null) {
                const pickedList = [];

                for (let i = 0; i < count; i++) {
                    let pickedIndex = Math.floor(Math.random() * Math.floor(elements.length));
                    // prevent Dendro! doesnt exist yet (eid = 3)
                    while (elements[pickedIndex].eid === 3) {
                        pickedIndex = Math.floor(Math.random() * Math.floor(elements.length));
                    }
                    pickedList.push(elements[pickedIndex]);
                }
                callback(pickedList, null);
            } else {
                // forward error
                callback(null, err);
            }
        };
        super.allElements(elementcallback);
    }

    /**
     * GET a list of random weapons
     * @param {requestCallback} callback callback to handle result/error
     * @param {number} count number of random weapons
     */
    randomWeapon (callback, count) {
        const weaponCallback = function (weapons, err) {
            if (err == null) {
                const pickedList = [];

                for (let i = 0; i < count; i++) {
                    const pickedIndex = Math.floor(Math.random() * Math.floor(weapons.length));
                    pickedList.push(weapons[pickedIndex]);
                }
                callback(pickedList, null);
            } else {
                // forward error
                callback(null, err);
            }
        };
        super.allWeapontypes(weaponCallback);
    }

    /**
     * GET a random dungeon
     * @param {requestCallback} callback callback to handle result/error
     */
    randomDungeon (callback) {
        const dungeonCallback = function (dungeons, err) {
            if (err == null) {
                const pickedIndex = Math.floor(Math.random() * Math.floor(dungeons.length));
                callback(dungeons[pickedIndex], null);
            } else {
                // forward error
                callback(null, err);
            }
        };
        super.allDungeons(dungeonCallback);
    }

    /**
     * GET a random normal boss
     * @param {requestCallback} callback callback to handle result/error
     */
    randomNormalBoss (callback) {
        const bossCallback = function (boss, err) {
            if (err == null) {
                const pickedIndex = Math.floor(Math.random() * Math.floor(boss.length));
                callback(boss[pickedIndex], null);
            } else {
                // forward error
                callback(null, err);
            }
        };
        super.allNormalBoss(bossCallback);
    }

    /**
     * GET ressources for selected weekday
     * @param {requestCallback} callback callback to handle result/error
     * @param {number} weekday weekday (0-6) sunday to saturday
     */
    ressourcesForWeekday (callback, weekday) {
        const service = this;
        const regioncallback = function (regions, regionError) {
            if (regionError == null) {
                const talentcallback = function (talents, talentError) {
                    if (talentError == null) {
                        const figurecallback = function (figures, figureError) {
                            if (figureError == null) {
                                const weaponcallback = function (weapons, weaponError) {
                                    if (weaponError == null) {
                                        callback(regions, talents, figures, weapons, null);
                                    } else {
                                        callback(regions, talents, figures, null, weaponError);
                                    }
                                };
                                service.allWeaponMaterialForWeekday(weaponcallback, weekday);
                            } else {
                                callback(regions, talents, null, null, figureError);
                            }
                        };
                        service.allFigures(figurecallback);
                    } else {
                        callback(regions, null, null, null, talentError);
                    }
                };
                service.allTalentsForWeekday(talentcallback, weekday);
            } else {
                // failed fetching region
                callback(null, null, null, null, regionError);
            }
        };
        super.allLocations(regioncallback);
    };

    /**
     * GET banner details for selected date
     * @param {requestCallback} callback callback to handle result/error
     * @param {number} time date in format YYYYMMDD
     */
    bannerforTime (callback, time) {
        const service = this;
        const bannerCallback = function (banner, bannerError) {
            if (bannerError == null && bannerError !== undefined) {
                if (banner != null && banner != null) {
                    const bannerObj = banner[0];
                    const figureCallback = function (figure, figureError) {
                        if (figureError == null) {
                            callback(bannerObj, figure);
                        } else {
                            callback(null, null, 'Invalid request for figure banner.');
                        }
                    };

                    service.allFiguresForSelectedBanner(figureCallback, bannerObj.gbid);
                } else {
                    callback(null, null, 'Invalid number of banner.');
                }
            } else {
                callback(null, null, bannerError);
            }
        };

        super.targetBannerInTime(bannerCallback, time);
    };

    bannerForId (callback, gbid) {
        const service = this;
        const bannerCallback = function (banner, bannerError) {
            if (bannerError == null && bannerError !== undefined) {
                if (banner != null && banner != null) {
                    const bannerObj = banner[0];
                    const figureCallback = function (figure, figureError) {
                        if (figureError == null) {
                            callback(bannerObj, figure);
                        } else {
                            callback(null, null, 'Invalid request for figure banner.');
                        }
                    };

                    service.allFiguresForSelectedBanner(figureCallback, bannerObj.gbid);
                } else {
                    callback(null, null, 'Invalid banner id.');
                }
            } else {
                callback(null, null, bannerError);
            }
        };

        super.targetBanner(bannerCallback, gbid);
    };

    /**
     * GET boss details
     * @param {requestCallback} callback callback to handle result/error
     */
    boss (callback) {
        const service = this;
        const bosscallback = function (bosslist, bossError) {
            if (bossError == null) {
                const bossdropscallback = function (bossdroplist, dropError) {
                    if (dropError == null) {
                        const figurbossdropcallback = function (figuredroplist, figureError) {
                            if (figureError == null) {
                                callback(bosslist, bossdroplist, figuredroplist, null);
                            } else {
                                callback(bosslist, bossdroplist, null, figureError);
                            }
                        };
                        service.allFiguresWithBossDrops(figurbossdropcallback);
                    } else {
                        callback(bosslist, null, null, dropError);
                    }
                };
                service.allBossDrops(bossdropscallback);
            } else {
                // failed fetching boss
                callback(null, null, null, bossError);
            }
        };
        super.allBosses(bosscallback);
    };

    /**
     * GET all talents
     * @param {requestCallback} callback callback to handle result/error
     */
    talent (callback) {
        const service = this;
        const talentCallback = function (talents, talentError) {
            if (talentError == null) {
                const figurecallback = function (figures, figureError) {
                    if (figureError == null) {
                        const weekdayCallback = function (weekdays, weekdayError) {
                            if (figureError == null) {
                                callback(talents, figures, weekdays, null);
                            } else {
                                callback(talents, figures, null, weekdayError);
                            }
                        };
                        service.allTalentSchedules(weekdayCallback);
                    } else {
                        callback(talents, null, null, figureError);
                    }
                };
                service.allFigures(figurecallback);
            } else {
                // failed fetching boss
                callback(null, null, null, null, talentError);
            }
        };
        super.allTalents(talentCallback);
    }

    /**
     * GET a Figure and banner by figure name
     * @param {requestCallback} callback callback to handle result/error
     * @param {string} name figure name
     */
    singleFigureWithBanner (callback, name) {
        const service = this;

        const figureCallback = function (figure, figureError) {
            if (figureError == null && figure != null) {
                // request banner information
                const bannerCallback = function (banners, bannerError) {
                    if (bannerError == null) {
                        callback(figure, banners, null);
                    } else {
                        callback(figure, null, null);
                    }
                };

                service.allBannerForSelectedFigure(bannerCallback, figure.fid);
            } else {
                // error occured
                callback(null, null, figureError);
            }
        };

        this.singleFigure(figureCallback, name);
    }

    levelupFigure (callback, start, end) {
        const service = this;

        const expCallback = function (exps, expError) {
            if (expError == null) {
                const levelupEntries = function (levelupEntries, lvUpError) {
                    if (lvUpError == null) {
                        const moraCallback = function (moraList, moraError) {
                            if (moraError == null) {
                                callback(exps, levelupEntries, moraList, null);
                            } else {
                                callback(exps, levelupEntries, null, moraError);
                            }
                        };
                        service.allLevelupFigureMora(moraCallback);
                    } else {
                        callback(exps, null, null, lvUpError);
                    }
                };
                service.allLevelupFigureEntries(levelupEntries, start, end);
            } else {
                // error occured
                callback(null, null, null, expError);
            }
        };

        this.levelupFigureExp(expCallback, start, end);
    }

    levelupWeapon (callback, start, end) {
        const service = this;

        const expCallback = function (exps, expError) {
            if (expError == null) {
                const levelupEntries = function (levelupEntries, lvUpError) {
                    if (lvUpError == null) {
                        const moraCallback = function (moraList, moraError) {
                            if (moraError == null) {
                                callback(exps, levelupEntries, moraList, null);
                            } else {
                                callback(exps, levelupEntries, null, moraError);
                            }
                        };
                        service.allLevelupWeaponMora(moraCallback);
                    } else {
                        callback(exps, null, null, lvUpError);
                    }
                };
                service.allLevelupWeaponEntries(levelupEntries, start, end);
            } else {
                // error occured
                callback(null, null, null, expError);
            }
        };

        this.levelupWeaponExp(expCallback, start, end);
    }
};

module.exports = YuanShenService;
