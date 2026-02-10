import { PerkDefinitions } from './PerkDefinitions.js';

export class PerkSystem {
    constructor(entityManager) {
        this.em = entityManager;
    }

    getPerks(entityId) {
        let perks = this.em.get(entityId, 'Perks');
        if (!perks) {
            perks = {};
            this.em.add(entityId, 'Perks', perks);
        }
        return perks;
    }

    addPerk(entityId, perkId) {
        const perks = this.getPerks(entityId);
        const perkDef = PerkDefinitions.get(perkId);
        if (!perkDef) return false;

        const current = perks[perkId] || 0;
        if (current >= perkDef.ranks) return false;

        perks[perkId] = current + 1;
        this._applyPerkEffect(entityId, perkDef);
        return true;
    }

    hasPerk(entityId, perkId) {
        const perks = this.getPerks(entityId);
        return (perks[perkId] || 0) > 0;
    }

    getPerkRank(entityId, perkId) {
        const perks = this.getPerks(entityId);
        return perks[perkId] || 0;
    }

    _applyPerkEffect(entityId, perkDef) {
        const stats = this.em.get(entityId, 'Stats');
        if (!stats) return;

        const e = perkDef.effect;
        if (e.bonusAP) { stats.maxAP += e.bonusAP; stats.ap += e.bonusAP; }
        if (e.bonusHP) { stats.maxHP += e.bonusHP; stats.hp += e.bonusHP; }
        if (e.damageResist) { stats._damageResist = (stats._damageResist || 0) + e.damageResist; }
    }
}
