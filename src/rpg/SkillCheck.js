import { rollPercent } from '../core/Utils.js';

export class SkillCheck {
    static check(stats, skillName, difficulty = 0) {
        const skillValue = stats.skills[skillName] || 0;
        const target = skillValue - difficulty;
        const roll = rollPercent();
        const success = roll <= target;

        return {
            success,
            roll: Math.round(roll),
            target: Math.round(target),
            skillValue,
            isCritSuccess: roll <= Math.floor(target / 10),
            isCritFailure: roll >= 95 + Math.floor((100 - target) / 10),
        };
    }

    static getChance(stats, skillName, difficulty = 0) {
        const skillValue = stats.skills[skillName] || 0;
        return Math.max(1, Math.min(99, skillValue - difficulty));
    }

    static statCheck(stats, statName, difficulty = 0) {
        const statValue = stats[statName] || 5;
        const target = statValue * 10 - difficulty;
        const roll = rollPercent();
        return {
            success: roll <= target,
            roll: Math.round(roll),
            target: Math.round(target),
        };
    }
}
