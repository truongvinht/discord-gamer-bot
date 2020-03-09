// pokemon.js
// Model object Pokemon
// ================

class Pokemon {
    constructor(name, stats) {
	    this.name = name;
	    this.stats = stats;
    }

    basedStats() {
        return {hp:this.stats.field_base_hp, 
                atk:this.stats.field_base_attack,
                def:this.stats.field_base_defense,
                sp_atk:this.stats.field_base_sp_att,
                sp_def:this.stats.field_base_sp_def,
                ini:this.stats.field_base_speed};
    }
    maxedStats() {
        return {hp:this.stats.field_max_hp, 
                atk:this.stats.field_max_attack,
                def:this.stats.field_max_defense,
                sp_atk:this.stats.field_max_sp_atk,
                sp_def:this.stats.field_max_sp_def,
                ini:this.stats.field_max_speed};
    }

    toString() {
        return `[${this.name}, ${this.stats}]`;
    }
};

// export
module.exports = {
    Pokemon:Pokemon
};