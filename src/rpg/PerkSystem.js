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
        if (e.showEnemyInfo) stats._showEnemyInfo = true;
        if (e.rangedAPReduction) stats._rangedAPReduction = (stats._rangedAPReduction || 0) + e.rangedAPReduction;
        if (e.itemAPReduction) stats._itemAPReduction = (stats._itemAPReduction || 0) + e.itemAPReduction;
        if (e.aimedShotBonus) stats._aimedShotBonus = true;
        if (e.meleeCritAlways) stats._meleeCritAlways = true;
        if (e.critDamageBonus) stats._critDamageBonus = (stats._critDamageBonus || 0) + e.critDamageBonus;
        if (e.bonusPerceptionRange) stats._bonusPerceptionRange = (stats._bonusPerceptionRange || 0) + e.bonusPerceptionRange;
    }
}
