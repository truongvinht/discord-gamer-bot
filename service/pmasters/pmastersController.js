// pmastersController.js
// Controller to prepare pokemon content for discord response
// ================

const Discord = require("discord.js");
const c = require("../../helper/envHandler");
const service = require("./pmastersService");
const POKEMONMASTERS_TITLE = "Pokemon Masters"
const PokemonSyncEvent = require("./model/pokemonSyncEvent");
const servicesJson = require('./services.json');

// const
const LOGO_URL = "https://cdn.player.one/sites/player.one/files/styles/lg/public/2020/02/18/p1pokemonmatersnewtrainer.jpg"

const help = (PREFIX, author) => {

    let embed = new Discord.MessageEmbed()
    .setTitle(`General Commands`)
    .setAuthor(`${author}`)
    .setDescription(`Following commands are available:`)
    .addField(`${PREFIX}pmHelp`, `Pokemon Masters Help`)
    .setThumbnail(LOGO_URL);

    return embed;
}

const syncEvents = (message) => {

    const callback = function(responseJson) {

        var pokemonEvents = [];

        for (key in responseJson) {
            let entry = responseJson[key];
           
            let syncEvent = new PokemonSyncEvent.PokemonSyncEvent(
                entry.title,
                entry.featured_units,
                entry.units,
                entry.start,
                entry.end,
                entry.banner,
                entry.info
            ); 

            if (syncEvent.getEndDate().valueOf() > new Date().valueOf()) {
                pokemonEvents.push(syncEvent);
            }

        };
        
        writePokemonSyncPairEvent(message, pokemonEvents);
            
    };

    service.getSyncEvents(callback);
}

function writePokemonSyncPairEvent(message, syncPairs) {
    if (syncPairs.length > 0) {
        let pair = syncPairs.shift();

        let d = new Discord.MessageEmbed();
        d.setTitle(`${POKEMONMASTERS_TITLE} - Sync Pair Event`);
        //d.setDescription("$1, try $2 [$3]".replace("$1", player).replace("$2", pick['synergy']).replace("[$3]", "synergy"));
        d.setDescription(pair.target);
        d.setImage(servicesJson.baseUrl + "" + pair.getUrlPath());
        d.addField("Start",pair.getStartDate().toLocaleString('de-DE'));
        d.addField("End",pair.getEndDate().toLocaleString('de-DE'));

        message.channel.send(d).then(async function (message) {
            // write next player
            writePokemonSyncPairEvent(message, syncPairs);
        });
    }
}

//export
module.exports = {
    getHelpMessage: help,
    getSyncEvents:syncEvents
};