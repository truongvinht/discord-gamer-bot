
// pmastersController.js
// Controller to prepare pokemon content for discord response
// ================

const { EmbedBuilder } = require('discord.js');
const service = require('./pmastersService');
const POKEMONMASTERS_TITLE = 'Pokemon Masters';
const PokemonSyncEvent = require('./model/pokemonSyncEvent');
const servicesJson = require('./services.json');

// const
const LOGO_URL = 'https://cdn.player.one/sites/player.one/files/styles/lg/public/2020/02/18/p1pokemonmatersnewtrainer.jpg';

const help = (PREFIX, author) => {
    const embed = new EmbedBuilder()
        .setTitle(`${POKEMONMASTERS_TITLE} - Commands`)
        .setAuthor({ name: author })
        .setDescription('Following commands are available:')
        .addFields(
            { name: `${PREFIX}pmevent or /pmevent`, value: 'Pokemon Masters Current Sync Pair Event', inline: false }
        )
        .setThumbnail(LOGO_URL);

    return embed;
};

const syncEvents = (source) => {
    const callback = function (responseJson) {
        const pokemonEvents = [];
        // eslint-disable-next-line no-undef
        for (key in responseJson) {
            // eslint-disable-next-line no-undef
            const entry = responseJson[key];

            const syncEvent = new PokemonSyncEvent.PokemonSyncEvent(
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
        writePokemonSyncPairEvent(source, pokemonEvents);
    };

    service.getSyncEvents(callback);
};

function writePokemonSyncPairEvent (source, syncPairs) {
    if (syncPairs.length > 0) {
        const pair = syncPairs.shift();

        const d = new EmbedBuilder();
        d.setTitle(`${POKEMONMASTERS_TITLE} - Sync Pair Event`);
        d.setDescription(pair.target);
        d.setImage(servicesJson.baseUrl + '' + pair.getUrlPath());
        d.addFields(
            { name: 'Start', value: pair.getStartDate().toLocaleString('de-DE'), inline: false },
            { name: 'End', value: pair.getEndDate().toLocaleString('de-DE'), inline: false }
        );

        // Send response based on type
        // Interactions have commandName property, messages don't
        if (source.commandName) {
            // Slash command - use followUp after first reply
            if (syncPairs.length === 0) {
                source.reply({ embeds: [d] });
            } else {
                source.followUp({ embeds: [d] }).then(async function () {
                    writePokemonSyncPairEvent(source, syncPairs);
                });
            }
        } else {
            // Prefix command
            source.channel.send({ embeds: [d] }).then(async function (message) {
                writePokemonSyncPairEvent(message, syncPairs);
            });
        }
    }
}

// export
module.exports = {
    getHelpMessage: help,
    getSyncEvents: syncEvents
};
