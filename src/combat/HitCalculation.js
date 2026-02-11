import { clamp, distance } from '../core/Utils.js';
import { CoverType } from './CoverResolver.js';

export class HitCalculation {
    constructor(coverResolver) {
        this.coverResolver = coverResolver;
    }

    calculate(attacker, target, attackerPos, targetPos, weapon, bodyPart = null) {
        const skill = attacker.skills[weapon.skill] || 50;
        const perceptionBonus = (attacker.perception + (attacker._bonusPerceptionRange || 0) - 5) * 4;
        const dist = distance(attackerPos.x, attackerPos.y, targetPos.x, targetPos.y);
        const distPenalty = dist * 4;
        const aimedPenalty = bodyPart ? bodyPart.hitPenalty + (attacker._aimedShotBonus ? attacker.perception * 2 : 0) : 0;
        const targetAC = target.ac || 0;

        const cover = this.coverResolver.getCoverBetween(
            attackerPos.x, attackerPos.y, targetPos.x, targetPos.y
        );

        let coverBonus = this.coverResolver.getCoverBonus(cover);

        // Flanking negates cover
        const flanking = this.coverResolver.isFlanking(
            attackerPos.x, attackerPos.y, targetPos.x, targetPos.y
        );
        if (flanking) coverBonus = 0;

        const hitChance = skill + perceptionBonus - distPenalty + aimedPenalty - targetAC - coverBonus;

        return {
            hitChance: clamp(hitChance, 5, 95),
            cover,
            coverBonus,
            flanking,
            distance: dist,
        };
    }
}
