import { perks } from '../data/perks.js';

export class PerkDefinitions {
    static getAll() {
        return Object.values(perks);
    }

    static get(id) {
        return perks[id];
    }

    static getAvailable(stats, currentPerks = {}) {
        return Object.values(perks).filter(perk => {
            // Check level
            if (stats.level < perk.levelReq) return false;

            // Check ranks
            const current = currentPerks[perk.id] || 0;
            if (current >= perk.ranks) return false;

            // Check stat requirements
            if (perk.statReq) {
                for (const [stat, val] of Object.entries(perk.statReq)) {
                    if ((stats[stat] || 0) < val) return false;
                }
            }

            return true;
        });
    }
}
