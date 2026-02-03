// pokemonSyncEvent.js
// Model object for Pokemon Sync Event
// ================

class PokemonSyncEvent {
    constructor (title, target, units, start, end, banner, info) {
        this.title = title.split('&amp;').join('&');
        this.target = target.split('&amp;').join('&');
        this.units = units.split('&amp;').join('&');
        this.start = start;
        this.end = end;
        this.banner = banner;
        this.info = info.replace('<p>', '').replace('</p>', '');
    }

    getStartDate () {
        return new Date(this.start * 1000);
    }

    getEndDate () {
        return new Date(this.end * 1000);
    }

    getUrlPath () {
        const urlComponents = this.banner.split(' ');
        const url = urlComponents[3].replace('src="', '').replace('"', '');
        return url;
    }

    toString () {
        return `[${this.title}]`;
    }
};

// export
module.exports = {
    PokemonSyncEvent: PokemonSyncEvent
};
