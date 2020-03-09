// pmastersService.js
// Service to get Pokemon Masters data
// ================
const fetch = require('node-fetch');
const servicesJson = require('./services.json');

const pokemon = () => {
    fetch('https://gamepress.gg/sites/default/files/aggregatedjson/StatRankingsMastersPokemon.json')
    .then(res => res.json())
    .then(json => console.log(json));
}

const syncEvents = (callback) => {
    let URL = servicesJson['syncEvents'];

    fetch(URL)
    .then(res => res.json())
    .then(json => callback(json));
}

module.exports = {
    getPokemons: pokemon,
    getSyncEvents: syncEvents
}