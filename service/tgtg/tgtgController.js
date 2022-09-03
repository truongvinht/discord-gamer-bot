// yuanshenController.js
// Controller to prepare content for discord response
// ================

const ApiService = require('./service/tgtgApiService');
const PushService = require('./service/pushService');
const c = require('../../helper/envHandler');
let apiService = null;
let pushService = null;

const ITEM_IDS = ['796390', '702704', '636290'];

let reqMap = {};

function getApiService () {
    if (apiService == null) {
        apiService = new ApiService('https://apptoogoodtogo.com', '-', '80', false);
    }
    return apiService;
}

function getPushService () {
    if (pushService == null) {
        pushService = new PushService(c.pushoverUser, c.pushoverToken);
    }
    return pushService;
}

const check = () => {
    const date = new Date();
    const hour = date.getHours();

    // check between 5:00 - 20:59
    if (hour < 22 || hour > 5) {
        const callback = function (resp, err) {
            if (err === null) {
                console.log('Request Items');
                // for (let itemId in ITEM_IDS) {
                const accessToken = resp.access_token;
                const refreshToken = resp.refresh_token;
                requestWithDelay(accessToken, refreshToken);
                //getApiService().favorites(favCallback, c.tgtgUser, accessToken, refreshToken);
            } else {
                console.log(err);
            }
        };

        console.log('refresh token');
        getApiService().apiRefresh(callback, c.tgtgUser);
    } else {
        // reset after 9pm
        reqMap = {};
    }
};

const requestWithDelay = async (accessToken, refreshToken) => {
    for (const itemId of ITEM_IDS) {
        console.log(`Fetch ${itemId}`);
        requestItem(itemId, accessToken, refreshToken);
        // 15 sec delay
        await new Promise(resolve => setTimeout(resolve, 15000));
        console.log(`Waited for ${itemId}`);
    }
};

function requestItem (itemId, accessToken, refreshToken) {
    const favCallback = function (itemResp, itemErr) {
        if (itemErr === null) {
            checkItemForPush(itemResp);
        } else {
            console.log('Error');
            console.log(itemErr);
        }
    };

    getApiService().getItem(favCallback, c.tgtgUser, itemId, accessToken, refreshToken);
}

function checkItemForPush (itemResp) {
    const pushCallback = function (err, result) {
        if (err) {
            throw err;
        }
        console.log(result);
    };

    if (Object.prototype.hasOwnProperty.call(reqMap, itemResp.item_id)) {
        if (itemResp.items_available > 0 && reqMap[`${itemResp.item_id}`] < itemResp.items_available) {
            getPushService().pushNotification(itemResp.display_name, `Anzahl Verfügbar: ${itemResp.items_available}`, pushCallback);
        } else {
            console.log(`${itemResp.display_name} - Count ${itemResp.items_available}`);
        }
    } else {
        if (itemResp.items_available > 0) {
            // first call and item is available
            getPushService().pushNotification(itemResp.display_name, `Anzahl Verfügbar: ${itemResp.items_available}`, pushCallback);
        } else {
            // first call and not available
            console.log(`${itemResp.display_name} not available`);
        }
    }
    // save counter
    reqMap[`${itemResp.item_id}`] = itemResp.items_available;
}

// export
module.exports = {
    checkTgtg: check
};
