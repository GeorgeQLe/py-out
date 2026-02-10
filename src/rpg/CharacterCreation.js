import { DerivedStats } from './DerivedStats.js';
import { Stats } from '../ecs/components/Stats.js';

export class CharacterCreation {
    constructor() {
        this.totalPoints = 40;
        this.minStat = 1;
        this.maxStat = 10;
        this.maxTagSkills = 3;
        this.maxTraits = 2;

        this.special = {
            strength: 5,
            perception: 5,
            endurance: 5,
            charisma: 5,
            intelligence: 5,
            agility: 5,
            luck: 5,
        };

        this.tagSkills = new Set();
        this.selectedTraits = new Set();
        this.name = 'Wanderer';
    }

    get pointsUsed() {
        return Object.values(this.special).reduce((a, b) => a + b, 0);
    }

    get pointsRemaining() {
        return this.totalPoints - this.pointsUsed;
    }

    increaseStat(stat) {
        if (this.special[stat] < this.maxStat && this.pointsRemaining > 0) {
            this.special[stat]++;
            return true;
        }
        return false;
    }

    decreaseStat(stat) {
        if (this.special[stat] > this.minStat) {
            this.special[stat]--;
            return true;
        }
        return false;
    }

    toggleTagSkill(skill) {
        if (this.tagSkills.has(skill)) {
            this.tagSkills.delete(skill);
            return true;
        }
        if (this.tagSkills.size < this.maxTagSkills) {
            this.tagSkills.add(skill);
            return true;
        }
        return false;
    }

    toggleTrait(trait) {
        if (this.selectedTraits.has(trait)) {
            this.selectedTraits.delete(trait);
            return true;
        }
        if (this.selectedTraits.size < this.maxTraits) {
            this.selectedTraits.add(trait);
            return true;
        }
        return false;
    }

    finalize() {
        const stats = Stats({
            ...this.special,
            level: 1,
            xp: 0,
            skills: {},
        });

        DerivedStats.compute(stats);
        stats.hp = stats.maxHP;
        stats.ap = stats.maxAP;

        const baseSkills = DerivedStats.computeBaseSkills(stats);
        for (const [skill, value] of Object.entries(baseSkills)) {
            stats.skills[skill] = this.tagSkills.has(skill) ? value + 20 : value;
        }

        return {
            stats,
            tagSkills: [...this.tagSkills],
            traits: [...this.selectedTraits],
            name: this.name,
        };
    }
}
