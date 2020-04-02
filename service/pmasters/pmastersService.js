// pmastersService.js
// Service to get Pokemon Masters data
// ================
const fetch = require('node-fetch');
const servicesJson = require('./services.json');

const pokemon = (callback) => {
    fetch('https://gamepress.gg/sites/default/files/aggregatedjson/StatRankingsMastersPokemon.json')
        .then(res => res.json())
        .then(json => callback(json));
};

const syncEvents = (callback) => {
    const URL = servicesJson.syncEvents;

    fetch(URL)
        .then(res => res.json())
        .then(json => callback(json));
};

module.exports = {
    getPokemons: pokemon,
    getSyncEvents: syncEvents
};
