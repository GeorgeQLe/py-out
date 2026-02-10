import { traits } from '../data/traits.js';

export class TraitDefinitions {
    static getAll() {
        return Object.values(traits);
    }

    static get(id) {
        return traits[id];
    }

    static applyTraits(stats, selectedTraits) {
        for (const traitId of selectedTraits) {
            const trait = traits[traitId];
            if (!trait) continue;

            // Apply bonuses
            if (trait.bonus.agility) stats.agility += trait.bonus.agility;
            if (trait.bonus.strength) stats.strength += trait.bonus.strength;
            if (trait.bonus.allSpecial) {
                stats.strength += trait.bonus.allSpecial;
                stats.perception += trait.bonus.allSpecial;
                stats.endurance += trait.bonus.allSpecial;
                stats.charisma += trait.bonus.allSpecial;
                stats.intelligence += trait.bonus.allSpecial;
                stats.agility += trait.bonus.allSpecial;
                stats.luck += trait.bonus.allSpecial;
            }
            if (trait.bonus.critChanceBonus) {
                stats.critChance = (stats.critChance || 0) + trait.bonus.critChanceBonus;
            }
            if (trait.bonus.meleeDamageBonus) {
                stats.meleeDamage = (stats.meleeDamage || 0) + trait.bonus.meleeDamageBonus;
            }

            // Store trait flags on stats for systems to check
            if (trait.penalty.noAimedShots) stats._noAimedShots = true;
            if (trait.penalty.noACBonus) stats.ac = 0;
            if (trait.penalty.bonusAP) stats.maxAP += trait.penalty.bonusAP;
            if (trait.penalty.damageMult) stats._damageMult = trait.penalty.damageMult;
            if (trait.penalty.critDamageMult) stats._critDamageMult = trait.penalty.critDamageMult;
            if (trait.penalty.carryWeightMult) stats._carryWeightMult = trait.penalty.carryWeightMult;
            if (trait.penalty.skillPenalty) stats._skillPenalty = trait.penalty.skillPenalty;
        }

        return stats;
    }
}
