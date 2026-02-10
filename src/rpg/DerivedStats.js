export class DerivedStats {
    static compute(stats) {
        const { strength, perception, endurance, charisma, intelligence, agility, luck, level } = stats;

        stats.maxHP = 15 + strength + 2 * endurance + level * (Math.floor(endurance / 2) + 2);
        stats.maxAP = 5 + Math.floor(agility / 2);
        stats.ac = agility;
        stats.meleeDamage = Math.max(1, strength - 5 + 1);
        stats.critChance = luck;

        return stats;
    }

    static computeBaseSkills(stats) {
        const { strength, perception, endurance, charisma, intelligence, agility, luck } = stats;

        const base = {
            smallGuns: 5 + 4 * agility,
            bigGuns: 5 + 2 * agility,
            energyWeapons: 5 + 2 * perception,
            melee: 20 + 2 * (strength + agility),
            throwing: 5 + 4 * agility,
            doctor: 5 + perception + intelligence,
            firstAid: 2 * (perception + intelligence),
            sneak: 5 + 3 * agility,
            lockpick: 10 + perception + agility,
            steal: 5 + 3 * agility,
            traps: 10 + perception + agility,
            science: 4 * intelligence,
            repair: 3 * intelligence,
            speech: 5 * charisma,
            barter: 4 * charisma,
            gambling: 5 * luck,
            outdoorsman: 2 * (endurance + intelligence),
        };

        return base;
    }

    static getCarryWeight(strength) {
        return 25 + strength * 25;
    }

    static getSkillPointsPerLevel(intelligence) {
        return 5 + 2 * intelligence;
    }

    static getXPForLevel(level) {
        return level * (level - 1) * 500;
    }
}
