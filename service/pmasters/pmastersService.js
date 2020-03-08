// pmastersService.js
// Service to get Pokemon Masters data
// ================
const fetch = require('node-fetch');


const pokemon = () => {
    fetch('https://gamepress.gg/sites/default/files/aggregatedjson/StatRankingsMastersPokemon.json')
    .then(res => res.json())
    .then(json => console.log(json));
}

module.exports = {
    getPokemons: pokemon
}