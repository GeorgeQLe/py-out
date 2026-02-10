import { DerivedStats } from '../rpg/DerivedStats.js';
import { xpTable } from '../data/tables.js';

export class LevelUpSystem {
    constructor(entityManager, eventBus) {
        this.em = entityManager;
        this.eventBus = eventBus;
    }

    addXP(entityId, amount) {
        const stats = this.em.get(entityId, 'Stats');
        if (!stats) return;

        stats.xp += amount;
        this.eventBus.emit('xpGained', { entityId, amount, total: stats.xp });

        while (this._canLevelUp(stats)) {
            this._levelUp(entityId, stats);
        }
    }

    _canLevelUp(stats) {
        const nextLevel = stats.level + 1;
        if (nextLevel >= xpTable.length) return false;
        return stats.xp >= xpTable[nextLevel];
    }

    _levelUp(entityId, stats) {
        stats.level++;

        const oldMaxHP = stats.maxHP;
        DerivedStats.compute(stats);
        const hpGain = stats.maxHP - oldMaxHP;
        stats.hp = Math.min(stats.hp + hpGain, stats.maxHP);

        const skillPoints = DerivedStats.getSkillPointsPerLevel(stats.intelligence);

        this.eventBus.emit('levelUp', {
            entityId,
            level: stats.level,
            skillPoints,
            canPickPerk: stats.level % 3 === 0,  // Perk every 3 levels
        });
    }

    applySkillPoints(entityId, allocations) {
        const stats = this.em.get(entityId, 'Stats');
        if (!stats) return;

        for (const [skill, points] of Object.entries(allocations)) {
            const tagMultiplier = (stats._tagSkills && stats._tagSkills.includes(skill)) ? 2 : 1;
            stats.skills[skill] = (stats.skills[skill] || 0) + points * tagMultiplier;
        }
    }
}
